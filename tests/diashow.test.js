// Integrationstest der Diashow in jsdom mit einer (anonymisierten) Board-Momentaufnahme
// Aufruf: npm test
const fs = require('fs');
const { JSDOM } = require('jsdom');
// Platzhalter-IDs: die Tests sprechen nie mit dem echten TaskCards
const DOC_ID = '00000000-0000-4000-8000-00000000d0c0';
const PLAN_ID = '00000000-0000-4000-8000-0000000091a0';
const path = require('path');
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8'));
let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
html = html.replace(/<script src=[^>]+><\/script>/g, '').replace(/<link [^>]+>/g, ''); // externe Ressourcen weg

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/',
  beforeParse(w) {
    w.fetch = async (url, opts = {}) => {
      const json = o => ({ ok: true, status: 200, json: async () => o, text: async () => JSON.stringify(o) });
      if (/accesses$/.test(url)) return { ok: true, status: 201, text: async () => '{}' };
      const body = JSON.parse(opts.body || '{}');
      if (/createVisitor/.test(body.query)) return json({ data: { createVisitor: { id: 'v1' } } });
      if (body.variables && body.variables.id === PLAN_ID) return json({ data: { board: fx.p } });
      return json({ data: { board: fx.d } });
    };
    w.HTMLElement.prototype.scrollIntoView = () => {};
  } });
const w = dom.window, ev = s => w.eval(s);
const $ = id => w.document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (name, cond, info) => { console.log((cond ? '✔ ' : '✘ ') + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); if (!cond) fails++; };

(async () => {
  $('inUrl').value = `https://hb.taskcards.app/#/board/${DOC_ID}?token=test`;
  $('inPlan').value = `https://hb.taskcards.app/#/board/${PLAN_ID}?token=test`;
  $('inFull').checked = false;
  $('inDemo').checked = true; $('inDemoStart').value = '12:20'; $('inDemoSpeed').value = '0.5';
  await ev('start()');
  await sleep(50);

  // 1) Doku-Abgleich
  const m = ev(`cards.filter(c=>c._session).map(c=>c._title.slice(0,25)+' → '+c._session.room)`);
  check('9 Doku-Karten zugeordnet', m.length === 9, m);
  check('Zettelchaos → WERDERSEE', m.some(x => x.startsWith('Zettelchaos') && x.endsWith('WERDERSEE')));
  check('Kritische KI → BLOCKLAND', m.some(x => x.startsWith('Kritische') && x.endsWith('BLOCKLAND')));

  // 2) Demo-Uhr
  check('Demo-Uhr steht bei ca. 12:20', ev('nowMin()') === 12 * 60 + 20, ev('nowMin()'));
  check('Demo-Hinweis sichtbar', !$('demoBadge').hidden);
  const info = ev('(i => i && [i.mode, fmtMin(i.slot.start)])(planNow())');
  check('12:20 → Slot 11:45 läuft', info && info[0] === 'jetzt' && info[1] === '11:45', info);

  // 3) Sichtbarkeit im Demomodus
  const vis = ev(`cards.filter(c=>c._session && !cardVisible(c)).map(c=>c._title.slice(0,20))`);
  check('Dokus aus 13:45-Slot noch versteckt (3)', vis.length === 3, vis);

  // 4) Doku-Stand-Folie
  const ov = ev('buildOverviewSlide()');
  check('Doku-Stand: 6 von 19 (ohne Platzhalter)', ov.querySelector('.slot').textContent === '6 von 19 Sessions dokumentiert', ov.querySelector('.slot').textContent);
  check('3 Zeitslot-Spalten', ov.querySelectorAll('.col').length === 3);
  const counts = [...ov.querySelectorAll('.colhead')].map(h => h.textContent);
  check('Spaltenköpfe 4/7, 2/6, 0/6', counts.join('|').includes('4/7') && counts.join('|').includes('2/6') && counts.join('|').includes('0/6'), counts);
  check('Keine „Session 7.x“ mehr im Plan', !ov.textContent.includes('Session 7'));
  check('Slot 13:45 alles „kommt noch“', [...ov.querySelectorAll('.col')][2].querySelectorAll('.row.future').length === 6);

  // 5) Kennzeichnung „fehlende Doku“ (Modus both) nach Slot-Ende
  ev(`cfg.mark='both'; cfg.demoStart='13:00'; demoT0=Date.now();`);
  const ov2 = ev('buildOverviewSlide()');
  const miss = [...ov2.querySelectorAll('.row.missing .tt')].map(x => x.textContent);
  check('13:00, Modus both: fehlende Dokus aus Slot 1+2 markiert', miss.length === 7, miss.length);
  const now = ev('buildNowSlide()');
  check('„Jetzt läuft“ um 13:00 = Als Nächstes 13:45', now.querySelector('.slot').textContent.startsWith('13:45'), now.querySelector('.slot').textContent);
  ev(`cfg.mark='done'; cfg.demoStart='12:20'; demoT0=Date.now();`);
  const now2 = ev('buildNowSlide()');
  const docTiles = [...now2.querySelectorAll('.room.hasdoc .rt')].map(x => x.textContent);
  check('12:20: Kacheln mit ✅ (KI Fortgeschrittene, Alles KI)', docTiles.length === 2, docTiles);

  // 6) Rotation: nach je 3 Karten ein Einschub, „Jetzt läuft“ und „Doku-Stand“ im Wechsel
  ev('cfg.every=3; sinceExtra=0; extraPtr=0;');
  const seq = [];
  for (let k = 0; k < 12; k++) {
    ev('next()');
    const sl = [...$('slideWrap').querySelectorAll('.slide')].pop();
    seq.push(sl.classList.contains('now') ? 'NOW' : sl.classList.contains('overview') ? 'OVERVIEW' : 'card:' + (sl.querySelector('.title') || {}).textContent.slice(0, 12));
  }
  check('Rotation enthält NOW und OVERVIEW', seq.includes('NOW') && seq.includes('OVERVIEW'), seq);
  check('Keine versteckten 13:45-Dokus gezeigt', !seq.some(x => /Zettelchaos|Visual|KI beGreifen/.test(x)));

  // 7) Doku-Folie zeigt Raum + Zeit
  const ki = ev(`cards.findIndex(c=>c._title.startsWith('KI für Fortg'))`);
  ev(`show(${ki})`);
  const sess = [...$('slideWrap').querySelectorAll('.slide')].pop().querySelector('.session');
  check('Doku-Folie mit „📍 KNOOPSPARK · 11:45 Uhr“', sess && sess.textContent === '📍 KNOOPSPARK · 11:45 Uhr', sess && sess.textContent);

  // 8) Demo-Schleife nach Tagesende
  ev('demoT0 = Date.now() - 600*60000/0.5');   // 600 simulierte Minuten später
  check('Demo springt nach Tagesende zurück auf 12:20', ev('nowMin()') === 12 * 60 + 20, ev('nowMin()'));

  // 9) Ohne Demomodus: alles sichtbar
  ev('cfg.demo=false');
  check('Ohne Demo: alle Dokus sichtbar', ev('cards.every(cardVisible)'));

  // 10) Collage
  ev(`cfg.demo=false; photos.length=0; for(let i=0;i<100;i++) photos.push('blob:foto'+i); cfg.wall='';`);
  const ex = ev('extraList().map(x=>x.type)');
  check('100 Fotos → Collage statt 100 Einzelfolien', ex.includes('collage') && !ex.includes('photo') && ex.length <= 4, ex);
  const col = ev('buildCollage()');
  const n = col.querySelectorAll('.tile').length;
  check('Collage hat 7–9 Kacheln', n >= 7 && n <= 9, n);
  const srcs = [...col.querySelectorAll('img')].map(i => i.src);
  check('keine doppelten Fotos in einer Collage', new Set(srcs).size === srcs.length, srcs.length);
  ev(`photos.length=0; ['a','b','c','d'].forEach(x=>photos.push('blob:'+x));`);
  check('4 Fotos → Collage mit 4 Kacheln', ev('buildCollage()').querySelectorAll('.tile').length === 4);
  ev(`photos.length=0; ['a','b'].forEach(x=>photos.push('blob:'+x));`);
  check('2 Fotos → Einzelfolien wie bisher', ev('extraList().filter(x=>x.type==="photo").length') === 2);
  ev(`photos.length=0; for(let i=0;i<30;i++) photos.push('blob:f'+i); sinceExtra=99; extraPtr=0;`);
  ev('next()');
  const shown = [...$('slideWrap').querySelectorAll('.slide')].pop();
  check('Collage wird in der Rotation gezeigt', ev('extraList().some(x=>x.type==="collage")') && shown.className.includes('slide'), shown.className);

  // 11) Wechsel zu Zeitplan/Sessionplanung nimmt Sessionplan und Hashtag mit
  ev(`cfg.demo=false; cfg.plan='https://hb.taskcards.app/#/board/${PLAN_ID}?token=abc'; cfg.tag='#3B12'; cfg.planQr='';`);
  const vl = ev(`viewLink('zeitplan.html')`);
  check('Taste 2: Link enthält Sessionplan und Hashtag', vl === `zeitplan.html#plan=${PLAN_ID}.abc&tag=%233B12`, vl);

  console.log(fails ? `\n${fails} Test(s) fehlgeschlagen` : '\nAlle Tests bestanden');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FEHLER', e); process.exit(1); });
