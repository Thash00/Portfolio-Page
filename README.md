# Portfolio – Thashaanth Gnaneswaran

Eine persönliche Portfolio-Website im modernen Dark-Design-Stil, entwickelt im Rahmen des Moduls **EWEB** an der **Berner Fachhochschule (BFH)**.

**Live:** [thashaanth.github.io/Portfolio-Page](https://thashaanth.github.io/Portfolio-Page/)

---

## Über die Seite

Die Website präsentiert Thashaanth Gnaneswaran als ICT Application Manager und Wirtschaftsinformatik-Student. Sie besteht aus drei Hauptseiten mit einheitlicher Navigation und einem integrierten Portfolio-Chatbot.

| Seite | Inhalt |
|---|---|
| **Home** | Hero-Bereich, Kennzahlen, Skills, Projekte und KI-Chatbot |
| **Lebenslauf** | Berufserfahrung, Ausbildung, Zertifikate und Download des Original-CV |
| **Freizeit** | Hobbys Fitness, Fussball und Autos mit live FC-Barcelona-Daten |

---

## Features

- Responsive Design mit modernem Dark-Theme (Syne + DM Mono Fonts)
- Animierter Hero-Bereich mit Orb-Hintergrundeffekten und Grid-Overlay
- **Portfolio-Chatbot** – lokaler Demo-Assistent ohne externe API-Abhängigkeit, beantwortet Fragen zu Berufserfahrung, Ausbildung, Skills und Freizeit
- **Football-Data API Integration** – aktuelle FC-Barcelona-Spiele und Tabellenstand via statische JSON-Dateien
- Interaktive Skill-Visualisierung mit animierten Fortschrittsbalken
- Herunterladbare Zertifikate (SAFe, EFZ, Berufsmaturität) als PDF direkt eingebunden
- Vollständig statisch – läuft auf **GitHub Pages**

---

## Tech Stack

| Technologie | Verwendung |
|---|---|
| HTML / CSS / JavaScript | Gesamte Website (vanilla, kein Framework) |
| Google Fonts (Syne, DM Mono) | Typografie |
| Football-Data API v4 | FC-Barcelona-Daten (Spiele, Tabellenstand) |
| GitHub Actions | Automatisches Update der Fussballdaten alle 6 Stunden |
| GitHub Pages | Hosting (statisch aus Root `/`) |
| Python 3 | Script zum Abruf und Speichern der Football-API-Daten |

---

## Website anschauen – für Besucher

**Kein Setup, keine Installation, keine Accounts nötig.**

Die Website ist vollständig statisch und läuft direkt im Browser:

**[thashaanth.github.io/Portfolio-Page](https://thashaanth.github.io/Portfolio-Page/)**

Alle Features sind sofort verfügbar:

- Berufsprofil und Skills → **Home-Seite**
- Lebenslauf und Zertifikate herunterladen → Seite **Lebenslauf**
- FC-Barcelona-Daten und Hobbys → Seite **Freizeit**
- Mit dem Portfolio-Assistenten chatten → Button **KI-Chat** auf der Home-Seite

> Die FC-Barcelona-Daten werden alle 6 Stunden automatisch aktualisiert und sind als statische JSON-Dateien im Repository gespeichert. Kein Login nötig.

---

## Projektstruktur

```
Portfolio-Page/
├── .github/
│   └── workflows/
│       └── update-football-data.yml   # GitHub Actions: Football-Daten alle 6 Stunden aktualisieren
├── assets/
│   └── pdfs/
│       ├── CV_Thashaanth_Gnaneswaran.pdf   # Lebenslauf zum Download
│       ├── SAFe_Zertifikat.pdf             # Certified SAFe 6 Agilist
│       ├── Fähigkeitszeugnis.pdf           # EFZ Informatiker Systemtechnik
│       └── Berufsmaturitätszeugnis.pdf     # Berufsmaturität
├── css/
│   └── style.css                      # Gesamtes Styling (Dark Theme, Animationen, Responsive)
├── data/
│   └── football/
│       ├── barcelona-team.json        # FC-Barcelona-Teamdaten
│       ├── barcelona-last-matches.json   # Letzte 5 Spiele
│       ├── barcelona-next-matches.json   # Nächste 5 Spiele
│       └── barcelona-standings.json   # La-Liga-Tabellenstand (automatisch aktualisiert)
├── js/
│   ├── main.js                        # Portfolio-Chatbot-Logik
│   ├── football-data.js               # FC-Barcelona-Daten laden und anzeigen
│   ├── animations.js                  # Scroll-Animationen, Skill-Balken
│   └── nav.js                         # Navigation (mobile Toggle, Scroll-Verhalten)
├── index.html                         # Home-Seite (Hero, Skills, Projekte, Chatbot)
├── lebenslauf.html                    # Lebenslauf-Seite
└── freizeit.html                      # Freizeit-Seite (Hobbys, Fussball)
```

---

## Football-Data API – Wie es funktioniert

Die FC-Barcelona-Integration läuft vollautomatisch über GitHub Actions:

### Daten abrufen (automatisch alle 6 Stunden)

Ein Python-Script ruft vier Endpunkte der Football-Data API v4 ab und speichert die Antworten als lokale JSON-Dateien:

- Teamdaten (`/v4/teams/81`)
- Nächste Spiele (`/v4/teams/81/matches?status=SCHEDULED&limit=5`)
- Letzte Spiele (`/v4/teams/81/matches?status=FINISHED&limit=5`)
- La-Liga-Tabellenstand (`/v4/competitions/PD/standings`)

Die JSON-Dateien werden automatisch committed → Besucher sehen aktuelle Daten ohne eigenen API-Key.

### Manuell aktualisieren (optional)

Der Workflow lässt sich jederzeit manuell unter **Actions → Update Football Data → Run workflow** auslösen.

### API-Token einrichten

Für den eigenen Betrieb muss ein `FOOTBALL_DATA_TOKEN` als GitHub Secret hinterlegt werden:

**Repository → Settings → Secrets and variables → Actions → New repository secret**

```
Name:  FOOTBALL_DATA_TOKEN
Value: <dein Token von football-data.org>
```

---

## Portfolio-Chatbot

Der Chatbot auf der Home-Seite ist ein **lokaler Demo-Assistent** ohne externe API-Verbindung. Er beantwortet Fragen zu:

- Kompetenzen und Skills
- Berufserfahrung (RUAG AG, BBZ Biel-Bienne, Zivildienst)
- Ausbildung (BFH Wirtschaftsinformatik, EFZ)
- Zertifikate (SAFe, Fähigkeitszeugnis)
- Freizeit und Kontakt

Die Antworten basieren auf vordefinierten Fakten im `main.js`. Schnellantwort-Buttons erleichtern die häufigsten Fragen.

---

## Deployment (GitHub Pages)

Die Website wird automatisch aus dem Root-Verzeichnis auf dem `main`-Branch deployed.

**Einstellungen:** Repository → Settings → Pages → Branch: `main` / Folder: `/root`

Jeder Push auf `main` löst automatisch einen neuen Deploy aus.

---

## Häufige Probleme

### Fussball-Daten werden nicht angezeigt

Die Freizeitseite liest `data/football/*.json`. Falls die Dateien fehlen oder leer sind, kann der Workflow manuell unter **Actions → Update Football Data → Run workflow** ausgelöst werden. Voraussetzung: `FOOTBALL_DATA_TOKEN` ist als Secret hinterlegt.

### Bilder oder PDFs fehlen auf GitHub Pages

GitHub Pages läuft auf Linux → Dateinamen sind **case-sensitive**. Alle Dateinamen müssen exakt übereinstimmen (Gross-/Kleinschreibung beachten).

### Chatbot antwortet nicht korrekt

Der Chatbot verwendet einfaches Keyword-Matching. Kurze, klare Fragen mit Stichwörtern wie „Skills", „Erfahrung", „Ausbildung" oder „Zertifikat" liefern die besten Ergebnisse.

---

## Autor

**Thashaanth Gnaneswaran**  
Student Wirtschaftsinformatik / Digital Business & AI – Berner Fachhochschule (BFH)  
ICT Application Manager – RUAG AG

thashaanth@hotmail.com  
078 630 70 09  
[LinkedIn](https://ch.linkedin.com/in/thashaanth-gnaneswaran)

---

## Modul

**EWEB** – Web Engineering  
Berner Fachhochschule, Frühlingssemester 2026
