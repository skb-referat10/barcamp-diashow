# 🎞️ Barcamp-Diashow

Live-Diashow für das **Bremer BildungsBarcamp**. Die Seite zeigt die Session-Dokumentation und den Sessionplan aus [TaskCards](https://www.taskcards.de) automatisch auf dem Beamer. Neue Karten lädt sie regelmäßig nach. Sie besteht aus einer einzigen HTML-Datei, man muss nichts installieren und braucht keinen Server.

Entstanden am Barcamp-Tag #3B12 (19.11.2026), gepflegt vom Team digitale Schulentwicklung, Referat 10 (Senator für Kinder und Bildung Bremen).

## Was die Diashow kann

- **Session-Dokumentation:** Die Karten des Doku-Boards laufen nacheinander durch. Fotos erscheinen als Galerie mit langsamem Zoom, die ersten Seiten von PDFs als Bilder. Lange Texte werden zu einer animierten Wortwolke, Karten mit nur einem Link zu einem großen QR-Code. Neue Karten bekommen ein „NEU“-Badge.
- **Sessionplan:** Die Folie „Jetzt läuft“ zeigt alle Räume mit der laufenden (oder nächsten) Session. Unten läuft ein Laufband mit, und ein QR-Code führt zum ganzen Plan. Die Zeitslots inklusive „Session Plus“ erkennt die Diashow automatisch.
- **Doku-Abgleich:** Doku-Karten werden über ähnliche Titel der passenden Session zugeordnet. Die Folie „Doku-Stand“ zeigt je Zeitslot, welche Sessions schon dokumentiert sind. Platzhalter wie „Session 7.1“ werden ignoriert.
- **Fotos und Social Wall:** Ab 4 eigenen Fotos (Dateien, Ordner oder Drag & Drop) gibt es eine animierte Foto-Collage. Optional lässt sich eine Social Wall einbinden, z. B. Walls.io.
- **Demomodus:** Spielt den Barcamp-Tag mit simulierter Uhrzeit im Zeitraffer ab, z. B. für alle, die nicht dabei waren.
- **Corporate Design** nach dem Designhandbuch des Bremer BildungsBarcamps: Noto Sans, roter Verlauf mit Textur, echte Logo-Dateien und die Bremer Skyline in Schwarz. Mehr dazu unten unter „Corporate Design“.
- **Vollbild, Tastenkürzel, automatische Textanpassung** an die Bildschirmgröße.

## 🚀 Schnellstart für ein neues Barcamp

Die Seiten laufen direkt über GitHub Pages, man muss nichts herunterladen:

- **Diashow (Beamer):** https://skb-referat10.github.io/barcamp-diashow/
- **Mobiler Sessionplan (Handy/iPad):** https://skb-referat10.github.io/barcamp-diashow/plan.html

### Checkliste

1. **Boards anlegen.** Am einfachsten kopiert man die Boards des letzten Barcamps in TaskCards:
   - **Sessionplan** in der Ansicht Kanban: eine Spalte pro Raum, eine Spalte **„Zeitslot“**, außerdem „Hinweise“ und „Sessionvorschläge“.
   - **Session-Dokumentation:** eine Karte pro Session, oben eine Karte mit „Anleitung“ im Titel.
2. **Zeitslots pflegen.** Pro Slot gehört eine Karte in die Spalte „Zeitslot“, mit Start *und* Ende, z. B. `10:30 - 11:15 Uhr`. Wenn verlängert werden darf, steht dort außerdem „Session Plus“. **Jeder Slot bekommt eine eigene Kartenfarbe.** Die Sessions in den Raum-Spalten erhalten die Farbe ihres Slots.
   Anzahl der Slots, Räume und Uhrzeiten sind frei. Die Seiten lesen sie bei jedem Laden neu aus.
3. **Teilen-Links holen.** In TaskCards bei beiden Boards *Teilen → Link kopieren*. Der Link muss `?token=…` enthalten. Lese-Rechte genügen.
4. **Mobilen Sessionplan einrichten.** `plan.html` ohne Zusatz öffnen, beide Teilen-Links einfügen und auf „Link erzeugen“ tippen. Den QR-Code auf Plakate oder Folien bringen.
5. **Diashow einrichten.** Auf dem Beamer-Rechner die Diashow öffnen und im Startdialog eintragen:
   - Doku-Link, Sessionplan-Link und **Hashtag** der neuen Ausgabe
   - beim QR-Code „Ganzer Sessionplan“ den Link aus Schritt 4
   - optional Social Wall und Fotos, dazu Bildnachweis (z. B. „Foto: Vorname Nachname“) und ob Fotos schwarz-weiß gezeigt werden (Standard: an)
6. **Generalprobe im Demomodus.** Im Startdialog „Demomodus“ anhaken, Startzeit vor dem ersten Slot wählen, Zeitraffer z. B. 10. Dann einmal durchlaufen lassen: Stimmen Räume, Slots und Farben? Beim mobilen Plan geht das mit `&zeit=10:20` am Ende des Links.

> 💡 **Testen mit einem alten Barcamp:** Die Teilen-Links früherer Ausgaben einfach im Demomodus eintragen. Der Tag wird dann mit den echten Sessions und Dokus von damals nachgespielt. Das klappt nur, wenn das alte Board schon diese Struktur hatte: Spalte „Zeitslot“ und eine Farbe pro Slot.

### Typische Stolpersteine

- **Eine Session erscheint im falschen Slot:** Die Kartenfarbe passt nicht zur Farbe ihres Zeitslots.
- **Eine Spalte wird als Raum angezeigt, obwohl sie keiner ist** (z. B. „Pause“): Den Inhalt in „Hinweise“ verschieben. Ignoriert werden nur Spalten, die mit „Hinweise“, „Sessionvorschläge“, „Zeitslot“ oder „Ideen“ beginnen.
- **Ein Slot fehlt:** In der Zeitslot-Karte steht nur „ab 10:30“. Es braucht Start *und* Ende.
- **Platzhalter** wie „Session 7.1“, „-“, „frei“ oder „TBD“ werden automatisch ausgeblendet.
- **Kein Zugriff:** Der Link enthält kein `?token=…`, oder der Teilen-Link wurde in TaskCards zurückgezogen.

## 🖥️ Drei Beamer-Ansichten für den ganzen Tag

Mit den Tasten **1 / 2 / 3** wechselt man zwischen drei Ansichten. Alternativ die Maus bewegen, dann erscheint unten eine Leiste. Alle drei nutzen dieselben Einstellungen: Ist die Diashow eingerichtet, kennen die anderen Ansichten den Sessionplan automatisch.

| Taste | Ansicht | Wann |
|---|---|---|
| 1 | **🎞️ Diashow** (`index.html`) | während der Session-Blöcke und danach |
| 2 | **🕘 Zeitplan** (`zeitplan.html`) | vor dem Start, in Pausen, zwischendurch |
| 3 | **🎤 Sessionplanung** (`sessionplanung.html`) | während der Session-Vorstellung am Morgen |

### 🕘 Zeitplan

Zeigt den Tagesablauf als Timeline. Die Diashow liest ihn aus der Karte **„Zeitplan“** im Sessionplan-Board, mit einer Zeile pro Programmpunkt, z. B. `09:15 Uhr - Session-Vorstellung`. Rechts stehen der aktuelle Punkt groß mit Restzeit und Fortschritt, was danach kommt, und der QR-Code zum mobilen Sessionplan. Bei Session-Blöcken steht dabei, wie viele Sessions parallel laufen. Gibt es keine Zeitplan-Karte, baut die Ansicht den Ablauf aus den Zeitslots.

> ⚠️ Zeitplan und Sessionplanung brauchen den Link des **Sessionplan-Boards**, nicht den des Doku-Boards. Ist der falsche Link hinterlegt, zeigt die Seite einen Hinweis. Mit ⚙︎ in der Leiste unten (oder zweimal **S**) kann man den Link neu eingeben. Läuft die Diashow als heruntergeladene Datei, öffnen die Tasten 2/3 automatisch die Online-Fassung und nehmen den Sessionplan-Link mit.

### 🎤 Sessionplanung mit Vorstellungs-Timer

- **30-Sekunden-Timer** als großer Ring. Ab 10 Sekunden wird er gelb, ab 5 Sekunden rot, bei 0 blinkt die Fläche rot.
- **Leertaste** (oder Klick auf den Ring) startet sofort die **nächste Vorstellung**, beliebig oft. Ein Zähler zeigt „Vorstellung #12“.
- **Ton wählbar** (Taste **T** oder „🎵 Ton wählen“, mit ▶ Probe): Horn (Stadion), Schiffshorn, Pfiff, Buzzer, sanftes Ding, Kuckuck, Schulgong oder kein Ton. Dazu Ticken in den letzten 3 Sekunden (leise, deutlich, aus) und Lautstärke. Die Auswahl wird gemerkt.
- Daneben das **Live-Raster** aus Räumen und Zeitslots. Es wird alle 10 Sekunden aktualisiert und hebt neue Einträge hervor: „17 von 24 Plätzen belegt“.

| Taste | Funktion |
|---|---|
| Leertaste / Enter | nächste Vorstellung starten |
| P | Pause / weiter |
| + / − | Dauer ± 5 Sekunden (wird gemerkt) |
| M | Ton an/aus |
| T | Tonauswahl (Endsignal, Ticken, Lautstärke) |
| G | Raster aus-/einblenden (nur Timer, extra groß) |
| 0 | Zähler zurücksetzen |
| Esc | Timer anhalten |

> 🔊 Der Browser gibt Ton erst nach der ersten Bedienung frei. Den ersten Timer also per Tastendruck oder Klick starten. Vorher den Beamer-Ton testen!

## 📱 Mobiler Sessionplan (`plan.html`)

Eine zweite, für Handy und iPad gemachte Ansicht nur mit dem Sessionplan. Sie hat drei Reiter:

- **Jetzt:** Was läuft gerade wo, mit Restzeit und Fortschrittsbalken, darunter der nächste Slot. Ist im laufenden Slot eine eigene Session gemerkt, steht sie ganz oben.
- **Alle Sessions:** alle Slots mit Suche. Ein Tipp auf ☆ merkt eine Session. Ein Tipp auf die Session klappt die Beschreibung aus der Spalte „Sessionvorschläge“ auf, die automatisch zugeordnet wird. „✅ Doku online“ erscheint, sobald es eine Dokumentation gibt.
- **Mein Plan:** die gemerkten Sessions als Timeline, mit Hinweis bei zwei Sessions zur gleichen Zeit. Über „Plan teilen“ geht der Plan per Link an andere.

Der persönliche Plan wird **nur auf dem eigenen Gerät** gespeichert, ohne Login und Server. Die Ansicht lädt jede Minute neu und lässt sich über „Zum Home-Bildschirm“ wie eine App ablegen.

**Einrichtung durch die Orga:** `plan.html` ohne Zusatz öffnen, die Teilen-Links von Sessionplan und optional Doku-Board einfügen und auf „Link erzeugen“ tippen. Heraus kommen ein Link und ein QR-Code für die Teilnehmenden, z. B.
`…/plan.html#plan=<BoardID>.<Token>&doku=<BoardID>.<Token>`.
Den Link kann man auch in der Diashow beim QR-Code „Ganzer Sessionplan“ eintragen.

Zum Ausprobieren lässt sich mit `&zeit=10:20` eine Uhrzeit simulieren.

## Benutzung der Diashow

1. `index.html` im Browser öffnen, entweder direkt als Datei oder über GitHub Pages (siehe unten).
2. Im Startdialog den **Teilen-Link** des Doku-Boards einfügen, also mit `?token=…`. Optional auch den Teilen-Link des Sessionplans, Hashtag und Instagram-Kanal.
3. **Diashow starten.** Die Einstellungen merkt sich der Browser.

| Taste | Funktion |
|---|---|
| ← → | blättern |
| Leertaste | Pause |
| F | Vollbild an/aus |
| R | sofort neu laden |
| S | Einstellungen |

## Aufbau der TaskCards-Boards

Damit Sessionplan und Doku-Abgleich funktionieren, sollte die bewährte Struktur bleiben:

- **Sessionplan-Board** (Ansicht Kanban): eine Spalte pro Raum, dazu eine Spalte **„Zeitslot“**. Ihre Karten enthalten die Uhrzeiten, z. B. „10:30 - 11:15 Uhr ggf 15min Session Plus“. Die **Kartenfarbe verknüpft** Session und Zeitslot, also eine Farbe pro Slot. Die Spalten „Hinweise“ und „Sessionvorschläge“ werden ignoriert.
- **Doku-Board:** eine Karte pro Session. Der Titel sollte dem Sessiontitel ähneln, damit der Abgleich klappt. Karten mit „Anleitung“ im Titel werden ausgeblendet (einstellbar).

## Veröffentlichung über GitHub Pages

Unter *Settings → Pages → Branch `main` / root* aktivieren. Danach läuft die Diashow unter
`https://skb-referat10.github.io/barcamp-diashow/`.

Über eine https-Adresse laufen PDF-Anzeige und Vollbild zuverlässiger als bei einer lokal geöffneten Datei.

## Datenschutz und Sicherheit

- **Keine Zugangsdaten ins Repo!** Teilen-Links mit `?token=…` öffnen die Pinnwände für jede Person, die den Link hat. Sie werden nur im Browser gespeichert (localStorage), nie in dieser Datei.
- Die Seite spricht direkt mit TaskCards (Instanz `hb.taskcards.app`), über denselben anonymen Besucherzugang wie im Browser. Sie lädt außerdem Bibliotheken von **cdnjs** (QR-Codes, pdf.js) und die Schrift Noto Sans von **Bunny Fonts** (EU, statt Google Fonts).
- Eigene Fotos werden nur im Browser verkleinert und angezeigt, nirgendwohin hochgeladen.
- Bei einer Social Wall die Moderation einschalten. Fotos von Personen nur mit Einverständnis zeigen: Wer ein **rotes Band** trägt, möchte nicht fotografiert werden. Keine Fotos von Kindern.

## Corporate Design

Alle Ansichten folgen dem Designhandbuch des Bremer BildungsBarcamps:

- **Farben:** nur Barcamp-Rot `#b8253a`, Hellrot `#d43448`, Schwarz `#000`/`#1a1a1a`, Hellgrau `#e6e6e6` und Weiß. Flächen bekommen den roten Verlauf (160°) mit Textur.
- **Logo:** immer die Dateien aus `assets/` (weiß auf Rot, schwarz auf Hell). Den Schriftzug nie in Noto Sans nachbauen, nicht verzerren oder umfärben. Die Skyline gibt es nur in Schwarz.
- **Text:** immer „Bremer BildungsBarcamp“, gendern mit :Innen, keine Gedankenstriche.
- **Fotos:** am liebsten schwarz-weiß und mit Bildnachweis.

Der Test `tests/cd.test.js` prüft, dass keine Fremdfarben oder nachgebauten Schriftzüge in die Seiten rutschen.

## Technik

- Reines HTML/CSS/JavaScript ohne Build-Schritt: `index.html` (Diashow) und `plan.html` (mobiler Sessionplan) sind eigenständig; `zeitplan.html` und `sessionplanung.html` teilen sich `taskcards.js` (TaskCards-Zugriff, Plan-Auswertung) und `barcamp.css` (Corporate Design).
- TaskCards: GraphQL unter `https://hb.taskcards.app/graphql`. Der Zugriff läuft über einen anonymen Besucher (`mutation createVisitor`), die Freischaltung per `POST /api/boards/{boardId}/permissions/{token}/accesses` mit Header `x-token`.
- PDFs: pdf.js mit HTTP-Range-Abruf. Es werden nur die nötigen Teile geladen, auch bei großen Dateien. Gibt es Probleme mit dem Worker, rendert pdf.js im Hauptfenster.

### Tests

```bash
npm install
npm test
```

Die Tests laufen in [jsdom](https://github.com/jsdom/jsdom) mit einer anonymisierten Momentaufnahme der Boards (`tests/fixture.json`) und sprechen nie mit dem echten TaskCards. Sie prüfen unter anderem die Einhaltung des Corporate Designs, Doku-Abgleich, Demo-Uhr, Platzhalter-Filter, Rotation und Collage sowie bei der mobilen Ansicht Merken, Konflikte, Suche und das Teilen des eigenen Plans und bei Zeitplan und Sessionplanung Tagesablauf, Timer-Ablauf und Live-Raster.

## Lizenz

[MIT](LICENSE): frei nutzbar, veränderbar und weitergebbar, auch für andere Barcamps.

**Ausnahme:** Logos, Skyline und Hintergründe in `assets/` fallen nicht unter die MIT-Lizenz. Die Rechte liegen beim Orga-Team des Bremer BildungsBarcamps (siehe `assets/HINWEIS.md`).
