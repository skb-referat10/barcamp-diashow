// Prüft die Dateien auf Einhaltung des Design-Handbuchs des Bremer BildungsBarcamps:
// nur Rot, Schwarz, Grau und Weiß, keine Landschaft, echtes Logo statt nachgebautem Schriftzug
const fs = require('fs'), path = require('path');
const files = ['index.html', 'plan.html', 'zeitplan.html', 'sessionplanung.html', 'barcamp.css'];
let fails = 0;
const check = (name, cond, info) => { console.log((cond ? '✔ ' : '✘ ') + name + (info ? '  → ' + JSON.stringify(info) : '')); if (!cond) fails++; };

// Farbe ist „neutral“ (Grau/Schwarz/Weiß), wenn R, G und B fast gleich sind; sonst muss sie rot sein
function allowed(hex) {
  let h = hex.slice(1); if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  const grey = Math.max(r, g, b) - Math.min(r, g, b) <= 12;
  const red = r > 120 && g < 90 && b < 110;                      // Rot-Töne wie #b8253a, #d43448
  return grey || red;
}
for (const f of files) {
  const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  const bad = [...new Set((src.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || []))].filter(c => !allowed(c));
  check(`${f}: nur Rot, Schwarz, Grau, Weiß`, bad.length === 0, bad);
  check(`${f}: keine Landschaft (Himmel, Wolken, Hügel)`, !/--sky|--hill|class="wolke"|id="scene"/.test(src));
  check(`${f}: Schriftzug nicht nachgebaut`, !/class="brand">Bremer BildungsBarcamp</.test(src));
}
console.log(fails ? `\n${fails} CD-Prüfung(en) fehlgeschlagen` : '\nAlle CD-Prüfungen bestanden');
process.exit(fails ? 1 : 0);
