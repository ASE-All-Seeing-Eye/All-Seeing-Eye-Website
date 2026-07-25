# All Seeing Eye — Projektwebsite

Offizielle Projektwebsite der Diplomarbeit **All Seeing Eye** an der HTL Wien 3 Rennweg.

Die Website ist bewusst als statische Seite ohne Build-Schritt umgesetzt. Dadurch kann sie direkt über GitHub Pages oder jeden gewöhnlichen Webserver veröffentlicht werden.

## Lokal starten

Im Projektordner einen kleinen Webserver öffnen:

```powershell
py -m http.server 8080
```

Danach `http://localhost:8080` im Browser aufrufen.

## Teamfotos ergänzen

Die Fotos im Seitenverhältnis 4:5 unter diesen Dateinamen ablegen:

```text
assets/team/louis-steiner.jpg
assets/team/salih-hane.jpg
assets/team/martin-hristov.jpg
assets/team/efe-ilyas.jpg
```

Anschließend in `index.html` bei der jeweiligen Person die bereits vorbereitete
und auskommentierte `<img>`-Zeile aktivieren. Solange ein Bild fehlt, zeigt die
Website einen gestalteten Platzhalter mit Initialen.

## Dateien

```text
index.html           Inhalte und Seitenstruktur
styles.css           Gestaltung und responsive Layouts
script.js            Animationen, Navigation und Dialoge
assets/ase-logo.png  Projektlogo
assets/favicon.svg   Browser-Icon
```

## Veröffentlichung

Für GitHub Pages in den Repository-Einstellungen unter **Pages** die Quelle **Deploy from a branch** und anschließend den Branch `main` mit dem Ordner `/ (root)` auswählen.
