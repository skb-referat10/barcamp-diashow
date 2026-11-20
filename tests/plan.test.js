// Test der mobilen Sessionplan-Ansicht (plan.html) in jsdom – ohne echtes TaskCards
// Aufruf: npm test
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8'));
const DOC_ID = '00000000-0000-4000-8000-00000000d0c0';
const PLAN_ID = '00000000-0000-4000-8000-0000000091a0';
let html = fs.readFileSync(path.join(__dirname, '..', 'plan.html'), 'utf8')
  .replace(/<script src=[^>]+><\/script>/g, '').replace(/<link [^>]+>/g, '');
let fails = 0;
const check = (name, cond, info) => { console.log((cond ? '✔ ' : '✘ ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

function open(hash) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/plan.html' + hash,
    beforeParse(w) {
      w.scrollTo = () => {};
      w.fetch = async (url, opts = {}) => {
        const json = o => ({ ok: true, status: 200, json: async () => o });
        if (/accesses$/.test(url)) return { ok: true, status: 201 };
        const body = JSON.parse(opts.body || '{}');
        if (/createVisitor/.test(body.query)) return json({ data: { createVisitor: { id: 'v1' } } });
        if (body.variables.id === PLAN_ID) return json({ data: { board: JSON.parse(JSON.stringify(fx.p)) } });
        return json({ data: { board: fx.d } });
      };
    } });
  return dom.window;
}

(async () => {
  // Simulierter Barcamp-Tag 12:20 Uhr, mit Doku-Board
  const w = open(`#plan=${PLAN_ID}.t1&doku=${DOC_ID}.t2&zeit=12:20`);
  await sleep(150);
  const d = w.document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  check('Uhr zeigt simulierte Zeit 12:20', $('#clock').textContent === '12:20', $('#clock').textContent);
  check('„Jetzt“: Slot 11:45–12:30 läuft', $('.hero .when').textContent.includes('11:45–12:30'), $('.hero .when').textContent);
  const rooms = $$('.sess .title').map(x => x.textContent);
  check('„Jetzt“: 6 Sessions im Slot + 6 danach, keine Platzhalter', rooms.length === 12 && !rooms.some(t => /Session 7/.test(t)), rooms.length);
  check('Restzeit „noch 10 Min.“', $('.slothead .chip').textContent.includes('noch 10 Min.'), $('.slothead .chip').textContent);
  check('Doku-Hinweis: 2 im aktuellen + 3 im nächsten Slot', $$('.sess .doc').length === 5, $$('.sess .doc').length);
  // Beschreibung aus „Sessionvorschläge“
  const alles = $$('.sess').find(s => s.querySelector('.title').textContent === 'Alles KI oder was?');
  check('Beschreibung aus Sessionvorschlag zugeordnet', alles && alles.querySelector('.more') && alles.querySelector('.more').textContent === 'Vorschlag');
  alles.querySelector('.top').click(); await sleep(10);
  check('Antippen klappt Beschreibung auf', $$('.sess.open').length === 1);

  // Merken
  $$('.sess').find(s => s.querySelector('.title').textContent === 'Alles KI oder was?').querySelector('.star').click(); await sleep(10);
  check('Stern merkt Session', $('#mineCount').textContent === '1' && !$('#mineCount').hidden);
  check('Hero zeigt gemerkte Session', $('.hero h2').textContent.includes('Alles KI oder was?'), $('.hero h2').textContent);
  // zweite Session im selben Slot → Konflikt
  $$('.sess').find(s => s.querySelector('.title').textContent === 'Texte mit KI weiterdenken').querySelector('.star').click(); await sleep(10);
  check('Hinweis bei zwei Sessions zur gleichen Zeit', /gleiche Zeit/.test($('#toast').textContent), $('#toast').textContent);

  // Mein Plan
  $('nav button[data-tab="mein"]').click(); await sleep(10);
  check('Mein Plan: Konflikt-Warnung im Slot 11:45', $$('.warn').length === 1);
  check('Mein Plan: leere Slots mit „Session wählen“', $$('.empty button').length === 2);
  check('Plan im Gerät gespeichert', JSON.parse(w.localStorage.getItem('barcampPlan_' + PLAN_ID)).length === 2);

  // Alle Sessions + Suche
  $('nav button[data-tab="alle"]').click(); await sleep(10);
  check('Alle: 3 Zeitslots, 19 Sessions', $$('.slothead').length === 3 && $$('.sess').length === 19, [$$('.slothead').length, $$('.sess').length]);
  $('#search').value = 'korea'; $('#search').dispatchEvent(new w.Event('input')); await sleep(10);
  check('Suche „korea“ findet 1 Session', $$('.sess').length === 1);

  // Geteilter Plan wird übernommen
  const ids = JSON.parse(w.localStorage.getItem('barcampPlan_' + PLAN_ID)).map(x => x.slice(0, 8)).join(',');
  const w2 = open(`#plan=${PLAN_ID}.t1&zeit=12:20&mein=${ids}`);
  await sleep(150);
  check('Geteilter Plan: 2 Sessions übernommen', w2.document.querySelector('#mineCount').textContent === '2');
  check('mein=… wird aus der Adresse entfernt', !/mein=/.test(w2.location.hash), w2.location.hash);

  // Nach dem Barcamp
  const w3 = open(`#plan=${PLAN_ID}.t1&zeit=16:00`);
  await sleep(150);
  check('Nach dem letzten Slot: Dankeschön', /Alle Sessions sind vorbei/.test(w3.document.body.textContent));

  // Ohne Board → Einrichtung für die Orga
  const w4 = open('');
  await sleep(50);
  check('Ohne #plan: Einrichtungsseite', !!w4.document.getElementById('sPlan'));
  w4.document.getElementById('sPlan').value = `https://hb.taskcards.app/#/board/${PLAN_ID}?token=abc`;
  w4.document.getElementById('sMake').click(); await sleep(10);
  check('Einrichtung erzeugt Teilnehmenden-Link', w4.document.getElementById('shareLink').textContent.endsWith(`#plan=${PLAN_ID}.abc`), w4.document.getElementById('shareLink').textContent);

  console.log(fails ? `\n${fails} Test(s) fehlgeschlagen` : '\nAlle Tests der mobilen Ansicht bestanden');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
