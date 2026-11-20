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
   - optional Logo, Social Wall und Fotos
6. **Generalprobe im Demomodus.** Im Startdialog „Demomodus“ anhaken, Startzeit vor dem ersten Slot wählen, Zeitraffer z. B. 10. Dann einmal durchlaufen lassen: Stimmen Räume, Slots und Farben? Beim mobilen Plan geht das mit `&zeit=10:20` am Ende des Links.

> 💡 **Testen mit einem alten Barcamp:** Die Teilen-Links früherer Ausgaben einfach im Demomodus eintragen. Der Tag wird dann mit den echten Sessions und Dokus von damals nachgespielt. Das klappt nur, wenn das alte Board schon diese Struktur hatte: Spalte „Zeitslot“ und eine Farbe pro Slot.

### Typische Stolpersteine

- **Eine Session erscheint im falschen Slot:** Die Kartenfarbe passt nicht zur Farbe ihres Zeitslots.
- **Eine Spalte wird als Raum angezeigt, obwohl sie keiner ist** (z. B. „Pause“): Den Inhalt in „Hinweise“ verschieben. Ignoriert werden nur Spalten, die mit „Hinweise“, „Sessionvorschläge“, „Zeitslot“ oder „Ideen“ beginnen.
- **Ein Slot fehlt:** In der Zeitslot-Karte steht nur „ab 10:30“. Es braucht Start *und* Ende.
- **Platzhalter** wie „Session 7.1“, „-“, „frei“ oder „TBD“ werden automatisch ausgeblendet.
- **Kein Zugriff:** Der Link enthält kein `?token=…`, oder der Teilen-Link wurde in TaskCards zurückgezogen.

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
