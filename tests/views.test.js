// Tests für Zeitplan- und Sessionplanungs-Ansicht in jsdom – ohne echtes TaskCards
// Aufruf: npm test
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8'));
const PLAN_ID = '00000000-0000-4000-8000-0000000091a0';
const lib = fs.readFileSync(path.join(__dirname, '..', 'taskcards.js'), 'utf8');
let fails = 0;
const check = (name, cond, info) => { console.log((cond ? '✔ ' : '✘ ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function open(file, hash, storage) {
  // taskcards.js direkt einbetten, externe Ressourcen entfernen
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
    .replace(/<script src="taskcards.js[^"]*"><\/script>/, '<script>' + lib.replace(/<\/script>/g, '<\\/script>') + '</script>')
    .replace(/<script src=[^>]+><\/script>/g, '').replace(/<link [^>]+>/g, '');
  return new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/' + file + hash,
    beforeParse(w) {
      if (storage) Object.entries(storage).forEach(([k, v]) => w.localStorage.setItem(k, v));
      w.fetch = async (url, opts = {}) => {
        const json = o => ({ ok: true, status: 200, json: async () => o });
        if (/accesses$/.test(url)) return { ok: true, status: 201 };
        const body = JSON.parse(opts.body || '{}');
        if (/createVisitor/.test(body.query)) return json({ data: { createVisitor: { id: 'v1' } } });
        return json({ data: { board: JSON.parse(JSON.stringify(fx.p)) } });
      };
    } }).window;
}
const txt = w => w.document.body.textContent.replace(/\s+/g, ' ');

(async () => {
  // ---------- Zeitplan ----------
  let w = open('zeitplan.html', `#plan=${PLAN_ID}.t&zeit=09:20`);
  await sleep(150);
  const items = [...w.document.querySelectorAll('.item')];
  check('Zeitplan: 15 Programmpunkte gelesen', items.length === 15, items.length);
  check('09:20 → „Session-Vorstellung“ ist JETZT', w.document.querySelector('.item.now').textContent.includes('Session-Vorstellung'));
  check('Jetzt-Karte mit Restzeit „noch 25 Min.“', /noch 25 Min\./.test(w.document.querySelector('.nowcard').textContent), w.document.querySelector('.nowcard .rest').textContent);
  check('Danach: Impulsgespräch', /Impulsgespräch/.test(w.document.querySelector('.nextcard').textContent));
  check('Vergangene Punkte abgehakt (2)', w.document.querySelectorAll('.item.past').length === 2);
  w = open('zeitplan.html', `#plan=${PLAN_ID}.t&zeit=10:40`);
  await sleep(150);
  check('10:40 → Session-Block 1 mit „7 Sessions in 7 Räumen“', /Session-Block 1\s*7 Sessions in 7 Räumen/.test(w.document.querySelector('.item.now').textContent), w.document.querySelector('.item.now').textContent.trim());
  w = open('zeitplan.html', `#plan=${PLAN_ID}.t&zeit=08:00`);
  await sleep(150);
  check('08:00 → Willkommen, Start in 30 Min.', /Willkommen/.test(txt(w)) && /Start in 30 Min/.test(txt(w)));
  w = open('zeitplan.html', `#plan=${PLAN_ID}.t&zeit=15:30`);
  await sleep(150);
  check('15:30 → Dankeschön, ENDE abgehakt', /Schön, dass ihr da wart/.test(txt(w)) && w.document.querySelector('.item.end.past') !== null);
  // Link aus den Diashow-Einstellungen übernehmen (ohne #plan)
  w = open('zeitplan.html', '#zeit=09:20', { barcampDiashow: JSON.stringify({ plan: `https://hb.taskcards.app/#/board/${PLAN_ID}?token=t`, tag: '#3B12', planQr: 'https://example.test/plan.html#plan=x' }) });
  await sleep(150);
  // (QR-Bibliothek ist im Test nicht geladen – daher nur prüfen, dass der Link übernommen wurde)
  check('Übernimmt Board, Hashtag und Handy-QR-Link aus den Diashow-Einstellungen',
    w.document.querySelectorAll('.item').length === 15 && /#3B12/.test(txt(w)) && w.eval('C.planQr') === 'https://example.test/plan.html#plan=x');
  // falsches Board (Doku statt Sessionplan) → verständlicher Hinweis
  const savedP = fx.p; fx.p = { name: '#3B12 - Dokumentation', lists: [], cards: [{ id: 'x', title: 'Korea Live', description: 'Text', color: '#fff', kanbanPosition: null }] };
  w = open('zeitplan.html', `#plan=${PLAN_ID}.t&zeit=09:20`);
  await sleep(150);
  check('Doku-Board statt Sessionplan → Hinweis „Link des Doku-Boards“', /Kein Zeitplan gefunden/.test(txt(w)) && /Doku-Boards/.test(txt(w)));
  fx.p = savedP;
  // Zeitplan-Karte mit Emoji im Titel wird auch erkannt
  const zp = fx.p.cards.find(c => c.id === 'pzeitplan'); zp.title = '🗓️ Unser Zeitplan';
  w = open('zeitplan.html', `#plan=${PLAN_ID}.t&zeit=09:20`);
  await sleep(150);
  check('„🗓️ Unser Zeitplan“ wird erkannt', w.document.querySelectorAll('.item').length === 15);
  zp.title = 'Zeitplan ';
  w = open('zeitplan.html', '');
  await sleep(50);
  check('Ohne Board → Einrichtung', !!w.document.getElementById('bcLink'));

  // ---------- Sessionplanung ----------
  w = open('sessionplanung.html', `#plan=${PLAN_ID}.t`);
  await sleep(200);
  const ev = s => w.eval(s); let d = w.document;
  check('Raster: 19 von 24 Plätzen belegt', /19 von 24 Plätzen belegt/.test(txt(w)), d.querySelector('.stat') && d.querySelector('.stat').textContent);
  check('Raster: 8 Räume × 3 Slots, 5 frei', d.querySelectorAll('.grid .r').length === 8 && d.querySelectorAll('.cell.free').length === 5);
  check('Timer bereit mit 30 s', d.querySelector('.ring .num b').textContent === '30');
  // Start per Leertaste
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: ' ' })); await sleep(150);
  check('Leertaste startet Vorstellung #1', ev('T.state') === 'run' && /Vorstellung #1/.test(d.querySelector('.count').textContent));
  ev('T.end = Date.now() + 8000'); await sleep(150);
  check('≤10 s: Warnfarbe', d.querySelector('.timer').classList.contains('warn'));
  ev('T.end = Date.now() + 4500'); await sleep(150);
  check('≤5 s: rot, aber noch kein Ticken', d.querySelector('.timer').classList.contains('crit') && ev('T.lastBeep') === null, ev('T.lastBeep'));
  ev('T.end = Date.now() + 2500'); await sleep(150);
  check('≤3 s: leises Ticken beginnt', ev('T.lastBeep') === 3, ev('T.lastBeep'));
  ev('T.end = Date.now() - 10'); await sleep(150);
  check('0 s: „Zeit!“', ev('T.state') === 'done' && /Zeit!/.test(d.querySelector('.ring .num span').textContent) && d.querySelector('.timer').classList.contains('done'));
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: ' ' })); await sleep(150);
  check('Neustart: Vorstellung #2 läuft wieder ab 30', ev('T.state') === 'run' && ev('T.count') === 2 && d.querySelector('.ring .num b').textContent === '30');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'p' })); await sleep(150);
  check('P pausiert', ev('T.state') === 'pause' && /Pause/.test(d.querySelector('.ring .num span').textContent));
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: '+' }));
  check('+ verlängert auf 35 s und merkt sich das', ev('T.dur') === 35 && JSON.parse(w.localStorage.getItem('barcampDiashow')).pitchSec === 35);
  // Ton-Menü
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 't' })); await sleep(50);
  const sel = d.getElementById('mEnd');
  check('T öffnet Ton-Menü mit 8 Endsignalen, Standard „Horn“', !!sel && sel.options.length === 8 && sel.value === 'horn', sel && sel.options.length);
  sel.value = 'whistle'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  const tk = d.getElementById('mTick'); tk.value = 'off'; tk.dispatchEvent(new w.Event('change', { bubbles: true }));
  const vol = d.getElementById('mVol'); vol.value = '0.5'; vol.dispatchEvent(new w.Event('input', { bubbles: true }));
  const saved = JSON.parse(w.localStorage.getItem('barcampDiashow'));
  check('Auswahl wird gemerkt (Pfiff, kein Ticken, 50 %)', saved.pitchEnd === 'whistle' && saved.pitchTick === 'off' && saved.pitchVol === 0.5, saved);
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: ' ' })); await sleep(50);
  check('Leertaste im offenen Menü startet keinen Timer', ev('T.state') === 'pause');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); await sleep(50);
  check('Esc schließt das Menü', !d.getElementById('mEnd'));
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'g' })); await sleep(50);
  check('G blendet das Raster aus (nur Timer)', d.querySelector('.main').classList.contains('solo'));
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: '0' })); await sleep(50);
  check('0 setzt den Zähler zurück', ev('T.count') === 0);
  // neue Session erscheint beim nächsten Abruf und wird hervorgehoben
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'g' }));
  fx.p.cards.push({ id: 'pneu', title: 'Neue Session aus dem Test', description: 'Referent:in Z', color: '#e4e467', kanbanPosition: { listId: 'lm', position: 5 } });
  await ev('refresh()'); await sleep(50);
  check('Live: neue Session wird hervorgehoben, 20 von 24', d.querySelectorAll('.cell.new').length === 1 && /20 von 24/.test(txt(w)));
  fx.p.cards.pop();

  // Ton-Menü mit eigener Sounddatei
  d.querySelector('[data-act="menu"]').click(); await sleep(20);
  check('Ton-Menü bietet eigene Sounddatei an', !!d.querySelector('#mFile') && /Eigene Sounddatei/.test(d.querySelector('.menubox').textContent));
  check('Ohne Datei kein Eintrag „Eigene Datei“ in der Liste', ![...d.querySelectorAll('#mEnd option')].some(o => o.value === 'custom'));
  d.querySelector('.menubox .close').click(); await sleep(10);

  // QR-Tafel zur mobilen Ansicht
  check('Ohne Handy-Link kein QR-Knopf', !d.querySelector('[data-act="qr"]'));
  w = open('sessionplanung.html', `#plan=${PLAN_ID}.t&qr=${encodeURIComponent('https://x.test/plan.html')}`); d = w.document; await sleep(200);
  check('Mit Handy-Link gibt es den QR-Knopf', !!d.querySelector('.timer [data-act="qr"]'));
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'q' })); await sleep(50);
  check('Q zeigt die QR-Tafel statt des Timers', d.querySelector('.main').classList.contains('qr') && /Jetzt scannen/.test(txt(w)));
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: ' ' })); await sleep(50);
  check('Leertaste führt zurück zum Timer, ohne zu starten', !d.querySelector('.main').classList.contains('qr') && w.eval('T.state') === 'ready');

  console.log(fails ? `\n${fails} Test(s) fehlgeschlagen` : '\nAlle Tests von Zeitplan und Sessionplanung bestanden');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
