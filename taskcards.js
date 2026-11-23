// =====================================================================
// Gemeinsame Basis für Zeitplan- und Sessionplanungs-Ansicht
// - TaskCards-Zugriff (anonymer Besucher + Teilen-Token), Besucher wird gemerkt
// - Sessionplan-Board auslesen: Zeitslots, Räume, Sessions, Tagesablauf („Zeitplan“-Karte)
// - Einstellungen teilen mit der Diashow (gleicher Speicher im Browser)
// - Navigation zwischen den Ansichten (Tasten 1/2/3), Vollbild, Mauszeiger ausblenden
// =====================================================================
const BC = (() => {
  const LS_KEY = 'barcampDiashow';                 // dieselben Einstellungen wie die Diashow
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const fmt = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

  // ---------- Einstellungen ----------
  function parseShare(link) {
    const m = (link || '').match(/^(https?:\/\/[^\/#?]+).*?board\/([0-9a-f-]{36})/i);
    if (!m) return null;
    const t = link.match(/[?&]token=([^&#]+)/i);
    return { host: m[1], id: m[2], token: t ? decodeURIComponent(t[1]) : '' };
  }
  function readCfg() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) { return {}; } }
  function writeCfg(patch) { try { localStorage.setItem(LS_KEY, JSON.stringify(Object.assign(readCfg(), patch))); } catch (e) {} }

  // Reihenfolge: Adresse (#plan=ID.TOKEN&zeit=…) → gespeicherte Diashow-Einstellungen
  function conf() {
    const p = new URLSearchParams(location.hash.slice(1));
    const cfg = readCfg();
    let plan = null, host = 'https://' + (p.get('host') || 'hb.taskcards.app');
    const hp = p.get('plan');
    if (hp && /^[0-9a-f-]{36}/i.test(hp)) { const [id, token] = hp.split('.'); plan = { id, token: token || '' }; }
    else if (cfg.plan) { const s = parseShare(cfg.plan); if (s) { plan = { id: s.id, token: s.token }; host = s.host; } }
    return { plan, host, zeit: p.get('zeit'), tag: p.get('tag') || cfg.tag || '', planQr: p.get('qr') || cfg.planQr || autoMobile(cfg), cfg };
  }
  // Link zur mobilen Ansicht aus den gespeicherten TaskCards-Links bauen (wie in der Diashow)
  function autoMobile(cfg) {
    const p = parseShare(cfg.plan || ''); if (!p) return '';
    const hp = new URLSearchParams(); hp.set('plan', p.id + '.' + p.token);
    const d = parseShare(cfg.url || ''); if (d && d.id !== p.id) hp.set('doku', d.id + '.' + d.token);
    if (!/hb\.taskcards\.app$/.test(p.host)) hp.set('host', p.host.replace(/^https?:\/\//, ''));
    const base = location.protocol === 'file:' ? 'https://skb-referat10.github.io/barcamp-diashow/' : location.href.split(/[?#]/)[0].replace(/[^\/]*$/, '');
    return base + 'plan.html#' + hp.toString();
  }

  // ---------- Uhrzeit (mit #zeit=09:10 simulierbar) ----------
  const t0 = Date.now();
  function nowSec(c) {
    if (c.zeit && /^\d{1,2}:\d{2}$/.test(c.zeit)) {
      const [h, m] = c.zeit.split(':').map(Number);
      return h * 3600 + m * 60 + Math.floor((Date.now() - t0) / 1000);
    }
    const d = new Date(); return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }

  // ---------- TaskCards ----------
  let visitor = '';
  try { visitor = localStorage.getItem(LS_KEY + '_visitor') || ''; } catch (e) {}
  const granted = new Set();
  async function gql(c, query, variables) {
    const r = await fetch(c.host + '/graphql', { method:'POST', headers: { 'Content-Type':'application/json', 'x-token': visitor },
      body: JSON.stringify({ query, variables: variables || {} }) });
    return r.json();
  }
  async function grant(c, b, fresh) {
    if (fresh || !visitor) {
      const v = await gql(c, 'mutation { createVisitor { id } }');
      visitor = v.data.createVisitor.id; granted.clear();
      try { localStorage.setItem(LS_KEY + '_visitor', visitor); } catch (e) {}
    }
    if (b.token && !granted.has(b.id)) {
      const r = await fetch(`${c.host}/api/boards/${b.id}/permissions/${b.token}/accesses`, { method:'POST',
        headers: { 'Content-Type':'application/json', 'x-token': visitor }, body: JSON.stringify({ password:'' }) });
      if (!r.ok) throw new Error('Zugang verweigert (HTTP ' + r.status + ')');
    }
    granted.add(b.id);
  }
  async function loadBoard(c, b, query) {
    await grant(c, b, false);
    let j = await gql(c, query, { id: b.id });
    if (!j.data || !j.data.board) { await grant(c, b, true); j = await gql(c, query, { id: b.id }); }
    if (!j.data || !j.data.board) throw new Error('Board nicht lesbar');
    return j.data.board;
  }

  // ---------- Text ----------
  function plainText(html) {
    const d = document.createElement('div');
    d.innerHTML = (html || '').replace(/<br\s*\/?>|<\/(div|p|li|h\d)>/gi, '\n$&');
    d.querySelectorAll('script,style').forEach(x => x.remove());
    return d.textContent.replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }
  const firstLine = t => plainText(t).split('\n').map(s => s.trim()).filter(Boolean)[0] || '';
  const isPlaceholder = t => /^\s*(?:(?:session|slot|raum|platzhalter|frei|offen|tbd|tba|n\.?\s?n\.?)\b)?[\s\d.,:#?!\-–—_]*$/i.test(t || '');

  // ---------- Sessionplan-Board auslesen ----------
  const PLAN_Q = `query($id:String!){ board(id:$id){ name lists { id name position } cards { id title description color kanbanPosition { listId position } } } }`;
  const SKIP = /^(hinweise|sessionvorschl|zeitslot|ideen)/i;

  // Tagesablauf: Zeilen wie „09:15 Uhr - Session-Vorstellung“ aus einer Karte „Zeitplan“ (oder „Ablauf“/„Programm“)
  function parseAgenda(text) {
    const items = [];
    text.split('\n').forEach(line => {
      const m = line.trim().match(/^(\d{1,2})[:.](\d{2})\s*(?:uhr)?\s*[-–—:|]?\s*(.+)$/i);
      if (m && m[3].trim()) items.push({ start: (+m[1]) * 60 + (+m[2]), text: m[3].replace(/^[-–—\s]+/, '').trim() });
    });
    items.sort((a, b) => a.start - b.start);
    items.forEach((it, i) => { it.end = items[i + 1] ? items[i + 1].start : null; });
    // „ENDE“ als letzter Eintrag ist nur das Tagesende
    const last = items[items.length - 1];
    if (last && /^(ende|schluss|end)\b/i.test(last.text)) last.isEnd = true;
    return items;
  }

  // Karte mit „Zeitplan“, „Ablauf“ oder „Programm“ im Titel (auch mit Emoji davor); sonst jede Karte mit
  // mindestens 3 Zeilen der Form „09:15 Uhr - …“
  function findAgenda(cards) {
    const byTitle = cards.find(c => /(zeitplan|ablauf|programm)/i.test(firstLine(c.title)) && parseAgenda(plainText(c.description)).length >= 2);
    if (byTitle) return parseAgenda(plainText(byTitle.description));
    let best = [];
    cards.forEach(c => { const a = parseAgenda(plainText(c.title) + '\n' + plainText(c.description)); if (a.length >= 3 && a.length > best.length) best = a; });
    return best;
  }

  function parsePlan(b) {
    const inList = l => b.cards.filter(c => c.kanbanPosition && c.kanbanPosition.listId === l.id)
                               .sort((x, y) => x.kanbanPosition.position - y.kanbanPosition.position);
    const lists = [...b.lists].sort((x, y) => x.position - y.position);
    // Zeitslots
    const slotList = lists.find(l => /^zeitslot/i.test(l.name.trim()));
    const slots = [];
    if (slotList) inList(slotList).forEach(c => {
      const txt = plainText(c.title) + ' ' + plainText(c.description);
      const m = txt.match(/(\d{1,2})[:.](\d{2})\s*(?:uhr)?\s*[-–]\s*(\d{1,2})[:.](\d{2})/i);
      if (m) slots.push({ start: +m[1] * 60 + +m[2], end: +m[3] * 60 + +m[4], color: (c.color || '').toLowerCase(), plus: /session\s*plus/i.test(txt) });
    });
    slots.sort((a, b) => a.start - b.start);
    // Räume und Sessions
    const rooms = [], sessions = [];
    lists.filter(l => !SKIP.test(l.name.trim())).forEach(l => {
      rooms.push(l.name.trim());
      inList(l).forEach((c, i) => {
        const title = firstLine(c.title);
        if (isPlaceholder(title)) return;
        let si = slots.findIndex(s => s.color && s.color === (c.color || '').toLowerCase());
        if (si < 0 && i < slots.length) si = i;
        if (si >= 0) sessions.push({ id: c.id, room: l.name.trim(), slot: si, title, host: plainText(c.description).split('\n')[0].slice(0, 60) });
      });
    });
    // Sessionvorschläge zählen
    const prop = lists.find(l => /^sessionvorschl/i.test(l.name.trim()));
    const proposals = prop ? inList(prop).filter(c => firstLine(c.title)).length : 0;
    // Tagesablauf
    const agenda = findAgenda(b.cards);
    return { name: b.name || '', slots, rooms, sessions, proposals, agenda, hasSlotList: !!slotList };
  }

  async function loadPlan(c) {
    const P = parsePlan(await loadBoard(c, c.plan, PLAN_Q));
    // kein Zeitplan im Sessionplan? → im Doku-Board aus den Diashow-Einstellungen nachsehen
    if (!P.agenda.length && c.cfg.url) {
      const d = parseShare(c.cfg.url);
      if (d && d.id !== c.plan.id) {
        try { P.agenda = findAgenda((await loadBoard(c, { id: d.id, token: d.token }, `query($id:String!){ board(id:$id){ cards { title description } } }`)).cards); }
        catch (e) { console.warn('Doku-Board:', e.message); }
      }
    }
    return P;
  }

  // Sessionplan-Link vergessen und Einrichtung neu zeigen
  function resetPlan() { writeCfg({ plan: '' }); location.hash = ''; location.reload(); }

  // ---------- QR-Code ----------
  function qrSvg(text) {
    if (typeof qrcode !== 'function' || !text) return '';
    if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    const q = qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let x = 0; x < n; x++) if (q.isDark(r, x)) d += `M${x},${r}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/><path d="${d}"/></svg>`;
  }

  // ---------- Einrichtung, falls noch kein Sessionplan bekannt ----------
  function setupForm(box, title) {
    box.innerHTML = `<div class="setup"><span class="pill">Einrichtung</span><h1>${esc(title)}</h1>
      <p>Teilen-Link des <b>Sessionplan-Boards</b> einfügen, also das Board mit den Raum-Spalten, der Spalte „Zeitslot“ und der Karte „Zeitplan“ (nicht das Doku-Board), mit <code>?token=…</code>. Er wird im Browser gespeichert und auch von Diashow und den anderen Ansichten genutzt.</p>
      <input id="bcLink" placeholder="https://hb.taskcards.app/#/board/…?token=…">
      <button id="bcSave">Speichern & starten</button><div id="bcErr" class="err"></div></div>`;
    $('bcSave').onclick = () => {
      const v = $('bcLink').value.trim();
      if (!parseShare(v)) { $('bcErr').textContent = 'Das sieht nicht nach einem TaskCards-Board-Link aus.'; return; }
      writeCfg({ plan: v });
      location.reload();
    };
  }

  // ---------- Navigation zwischen den Ansichten + Vollbild ----------
  const VIEWS = [['1', 'index.html', 'Diashow'], ['2', 'zeitplan.html', 'Zeitplan'], ['3', 'sessionplanung.html', 'Sessionplanung']];
  // Läuft die Ansicht als Ebene in der Diashow, übernimmt die Diashow den Wechsel (kein Neuladen,
  // Vollbild bleibt). Allein geöffnet: zur Diashow mit #go (startet direkt), sonst Parameter mitnehmen.
  const embedded = window.parent !== window;
  function goView(file) {
    if (embedded) { window.parent.postMessage({ bcView: file }, '*'); return; }
    location.href = (file === 'index.html' ? 'index.html?v=2026-11-23d#go' : file + '?v=2026-11-23d' + location.hash);
  }
  function toggleFull() {
    if (embedded) { window.parent.postMessage({ bcFull: true }, '*'); return; }
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }
  // „S“ zweimal innerhalb von 3 s: Sessionplan-Link neu eingeben
  let armed = 0;
  function confirmReset() { if (Date.now() - armed < 3000) return true; armed = Date.now(); flash('Nochmal S drücken, um den Sessionplan-Link neu einzugeben'); return false; }
  function flash(msg) {
    let t = $('bcToast'); if (!t) { t = document.createElement('div'); t.id = 'bcToast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(flash.t); flash.t = setTimeout(() => t.classList.remove('show'), 3000);
  }

  function installChrome(current) {
    const nav = document.createElement('div');
    nav.id = 'bcNav';
    nav.innerHTML = VIEWS.map(([k, f, l]) => `<a href="${f}" data-f="${f}" class="${f === current ? 'on' : ''}"><kbd>${k}</kbd> ${l}</a>`).join('')
      + '<button type="button" id="bcFull">⛶ Vollbild</button><button type="button" id="bcSet" title="Sessionplan-Link ändern">⚙︎</button>';
    document.body.appendChild(nav);
    nav.addEventListener('click', e => { const a = e.target.closest('a[data-f]'); if (a) { e.preventDefault(); goView(a.dataset.f); } });
    $('bcFull').onclick = toggleFull;
    $('bcSet').onclick = () => { if (confirmReset()) resetPlan(); };
    document.addEventListener('fullscreenchange', () => { $('bcFull').textContent = document.fullscreenElement ? '✕ Vollbild beenden' : '⛶ Vollbild'; });
    document.addEventListener('keydown', e => {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      const v = VIEWS.find(([k]) => k === e.key);
      if (v && v[1] !== current) goView(v[1]);
      if (e.key.toLowerCase() === 'f') toggleFull();
      if (e.key.toLowerCase() === 's' && confirmReset()) resetPlan();
    });
    // Navigation und Mauszeiger nur bei Mausbewegung zeigen
    let t = null;
    document.addEventListener('mousemove', () => {
      document.body.classList.add('mouse'); document.body.classList.remove('idle');
      clearTimeout(t); t = setTimeout(() => { document.body.classList.remove('mouse'); document.body.classList.add('idle'); }, 3000);
    });
  }

  // Größte Schrift, bei der alles passt (binäre Suche)
  function maxFit(apply, fits, lo, hi) {
    let best = lo;
    while (hi - lo > 0.5) { const mid = (lo + hi) / 2; apply(mid); if (fits()) { best = mid; lo = mid; } else hi = mid; }
    apply(best); return best;
  }

  return { $, esc, fmt, conf, resetPlan, findAgenda, readCfg, writeCfg, parseShare, nowSec, loadPlan, parsePlan, parseAgenda, plainText, isPlaceholder,
           qrSvg, setupForm, installChrome, toggleFull, maxFit, flash };
})();
