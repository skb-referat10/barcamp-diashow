# 🎞️ Barcamp-Diashow

Live-Diashow für das **Bremer BildungsBarcamp**. Die Seite zeigt die Session-Dokumentation und den Sessionplan aus [TaskCards](https://www.taskcards.de) automatisch auf dem Beamer. Neue Karten lädt sie regelmäßig nach. Sie besteht aus einer einzigen HTML-Datei, man muss nichts installieren und braucht keinen Server.

Entstanden am Barcamp-Tag #3B12 (19.11.2026), gepflegt vom Team digitale Schulentwicklung, Referat 10 (Senator für Kinder und Bildung Bremen).

## Was die Diashow kann

- **Session-Dokumentation:** Die Karten des Doku-Boards laufen nacheinander durch. Fotos erscheinen als Galerie mit langsamem Zoom, die ersten Seiten von PDFs als Bilder. Lange Texte werden zu einer animierten Wortwolke, Karten mit nur einem Link zu einem großen QR-Code. Neue Karten bekommen ein „NEU“-Badge.
- **Sessionplan:** Die Folie „Jetzt läuft“ zeigt alle Räume mit der laufenden (oder nächsten) Session. Unten läuft ein Laufband mit, und ein QR-Code führt zum ganzen Plan. Die Zeitslots inklusive „Session Plus“ erkennt die Diashow automatisch.
- **Doku-Abgleich:** Doku-Karten werden über ähnliche Titel der passenden Session zugeordnet. Die Folie „Doku-Stand“ zeigt je Zeitslot, welche Sessions schon dokumentiert sind. Platzhalter wie „Session 7.1“ werden ignoriert.
- **Fotos und Social Wall:** Ab 4 eigenen Fotos (Dateien, Ordner oder Drag & Drop) gibt es eine animierte Foto-Collage. Optional lässt sich eine Social Wall einbinden, z. B. Walls.io.
- **Demomodus:** Spielt den Barcamp-Tag mit simulierter Uhrzeit im Zeitraffer ab, z. B. für alle, die nicht dabei waren.
- **Corporate Design** des Bremer BildungsBarcamps: Noto Sans, Barcamp-Rot, rote Pills und eine Himmel-Hügel-Landschaft. Ein Logo kann man optional hochladen.
- **Vollbild, Tastenkürzel, automatische Textanpassung** an die Bildschirmgröße.

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
- Bei einer Social Wall die Moderation einschalten. Fotos von Personen, besonders von Schüler:innen, nur mit Einverständnis zeigen.

## Technik

- Reines HTML/CSS/JavaScript in `index.html` (Diashow) und `plan.html` (mobiler Sessionplan), ohne Build-Schritt.
- TaskCards: GraphQL unter `https://hb.taskcards.app/graphql`. Der Zugriff läuft über einen anonymen Besucher (`mutation createVisitor`), die Freischaltung per `POST /api/boards/{boardId}/permissions/{token}/accesses` mit Header `x-token`.
- PDFs: pdf.js mit HTTP-Range-Abruf. Es werden nur die nötigen Teile geladen, auch bei großen Dateien. Gibt es Probleme mit dem Worker, rendert pdf.js im Hauptfenster.

### Tests

```bash
npm install
npm test
```

Die Tests laufen in [jsdom](https://github.com/jsdom/jsdom) mit einer anonymisierten Momentaufnahme der Boards (`tests/fixture.json`) und sprechen nie mit dem echten TaskCards. Sie prüfen unter anderem Doku-Abgleich, Demo-Uhr, Platzhalter-Filter, Rotation und Collage sowie bei der mobilen Ansicht Merken, Konflikte, Suche und das Teilen des eigenen Plans.

## Lizenz

[MIT](LICENSE): frei nutzbar, veränderbar und weitergebbar, auch für andere Barcamps.
