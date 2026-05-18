# Änderungen in Version 2

## Responsiveness

- Die TG-Animation im Hero-Bereich wird nun über `clamp()` skaliert.
- Der Hero-Bereich hat `overflow: visible`, damit die umlaufenden Icons nicht abgeschnitten werden.
- Für Tablet, Mobile und sehr kleine Geräte gibt es eigene Breakpoints.
- Bei reduzierter Bewegung (`prefers-reduced-motion`) werden Dauerschleifen deaktiviert.

## Code-Struktur

- HTML-Dateien wurden formatiert und mit deutschen Kommentaren versehen.
- CSS wurde lesbarer umgebrochen und mit zusätzlichen Kommentaren ergänzt.
- JavaScript-Dateien wurden strukturiert, kommentiert und in klar benannte Funktionen aufgeteilt.

## Dateien

- `index.html` – Startseite
- `lebenslauf.html` – Lebenslaufseite
- `freizeit.html` – Freizeitseite
- `css/style.css` – Layout, Design und responsive Regeln
- `js/nav.js` – Navigation
- `js/animations.js` – Zähler und Skill-Animationen
- `js/main.js` – lokaler Portfolio-Chatbot
