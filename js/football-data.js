/*
 * FC Barcelona Daten für GitHub Pages
 *
 * Zweck:
 * - Lädt lokale JSON-Dateien aus dem Ordner `data/football`.
 * - Die JSON-Dateien werden durch GitHub Actions mit der Football-Data API aktualisiert.
 * - Der Football-Data API-Token bleibt als GitHub Secret geschützt und steht nicht im Frontend-Code.
 *
 * Wichtig:
 * - Diese Datei funktioniert ohne Node.js und ohne direkten API-Call aus dem Browser.
 * - Dadurch werden typische CORS-Probleme vermieden.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     Konfiguration
     ------------------------------------------------------------ */

  const TEAM_ID = 81;
  const DATA_BASE_PATH = 'data/football';

  const DATA_FILES = {
    team: `${DATA_BASE_PATH}/barcelona-team.json`,
    next: `${DATA_BASE_PATH}/barcelona-next-matches.json`,
    last: `${DATA_BASE_PATH}/barcelona-last-matches.json`,
    standing: `${DATA_BASE_PATH}/barcelona-standings.json`,
  };

  /* ------------------------------------------------------------
     DOM-Elemente aus der Freizeitseite
     ------------------------------------------------------------ */

  const loadButton = document.getElementById('loadFootballData');
  const statusBox = document.getElementById('footballStatus');
  const crestBox = document.getElementById('footballCrest');
  const teamName = document.getElementById('footballTeamName');
  const teamMeta = document.getElementById('footballTeamMeta');
  const nextMatches = document.getElementById('footballNextMatches');
  const lastMatches = document.getElementById('footballLastMatches');
  const standingBox = document.getElementById('footballStanding');

  // Falls die aktuelle Seite keinen Football-Bereich hat, wird das Skript beendet.
  if (!loadButton || !statusBox) return;

  loadButton.addEventListener('click', loadFootballData);

  // Daten direkt beim Öffnen der Freizeitseite laden.
  loadFootballData();

  /* ------------------------------------------------------------
     Daten laden
     ------------------------------------------------------------ */

  /**
   * Lädt alle lokalen Football-JSON-Dateien und rendert die Karten.
   */
  async function loadFootballData() {
    setLoadingState(true);
    showStatus('FC-Barcelona-Daten werden aus lokalen JSON-Dateien geladen ...', 'loading');

    try {
      const [team, scheduledMatches, finishedMatches, standings] = await Promise.all([
        fetchJson(DATA_FILES.team),
        fetchJson(DATA_FILES.next),
        fetchJson(DATA_FILES.last),
        fetchJson(DATA_FILES.standing),
      ]);

      renderTeam(team);
      renderMatches(nextMatches, scheduledMatches.matches, 'Keine kommenden Spiele in den lokalen Daten gefunden.');
      renderMatches(lastMatches, finishedMatches.matches, 'Keine letzten Resultate in den lokalen Daten gefunden.');
      renderStanding(standings);
      showLastUpdated(team, scheduledMatches, finishedMatches, standings);
    } catch (error) {
      console.error('Fehler beim Laden der lokalen Football-Daten:', error);
      showStatus(
        `Daten konnten nicht geladen werden: ${error.message}. Prüfe, ob die GitHub Action bereits gelaufen ist und die JSON-Dateien im Ordner data/football vorhanden sind.`,
        'error'
      );
      renderFallbackState();
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Lädt eine einzelne lokale JSON-Datei.
   * @param {string} path Relativer Pfad zur JSON-Datei
   * @returns {Promise<object>} Geparste JSON-Daten
   */
  async function fetchJson(path) {
    const response = await fetch(path, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`${path} konnte nicht geladen werden (${response.status})`);
    }

    return response.json();
  }

  /* ------------------------------------------------------------
     Rendering: Clubdaten, Spiele und Tabelle
     ------------------------------------------------------------ */

  /**
   * Zeigt Basisinformationen zum Verein an.
   * @param {object} team Teamdaten
   */
  function renderTeam(team) {
    if (teamName) {
      teamName.textContent = team.name || 'FC Barcelona';
    }

    if (teamMeta) {
      const country = team.area?.name || 'Spanien';
      const founded = team.founded ? ` · gegründet ${team.founded}` : '';
      const venue = team.venue ? ` · ${team.venue}` : '';
      teamMeta.textContent = `${country}${founded}${venue}`;
    }

    if (crestBox && team.crest) {
      crestBox.innerHTML = `<img src="${escapeHtml(team.crest)}" alt="Wappen von ${escapeHtml(team.name || 'FC Barcelona')}" />`;
      crestBox.classList.add('has-crest');
    }
  }

  /**
   * Rendert eine Liste von Spielen.
   * @param {HTMLElement} target Ziel-Liste
   * @param {Array<object>} matches Match-Liste
   * @param {string} emptyText Text, falls keine Spiele vorhanden sind
   */
  function renderMatches(target, matches = [], emptyText) {
    if (!target) return;

    if (!matches.length) {
      target.innerHTML = `<li><span>${escapeHtml(emptyText)}</span></li>`;
      return;
    }

    target.innerHTML = matches
      .map((match) => {
        const date = formatMatchDate(match.utcDate);
        const score = formatScore(match);
        const competition = match.competition?.name || 'Wettbewerb';
        const homeTeam = match.homeTeam?.shortName || match.homeTeam?.name || 'Heimteam';
        const awayTeam = match.awayTeam?.shortName || match.awayTeam?.name || 'Auswärtsteam';

        return `
          <li>
            <span>${escapeHtml(competition)} · ${escapeHtml(date)}</span>
            <strong>${escapeHtml(homeTeam)} ${escapeHtml(score)} ${escapeHtml(awayTeam)}</strong>
            <small>${escapeHtml(translateStatus(match.status))}</small>
          </li>
        `;
      })
      .join('');
  }

  /**
   * Zeigt den aktuellen Tabellenplatz von FC Barcelona.
   * @param {object} standings Tabellen-Antwort aus Football-Data
   */
  function renderStanding(standings) {
    if (!standingBox) return;

    const totalStanding = standings.standings?.find((entry) => entry.type === 'TOTAL');
    const barcaStanding = totalStanding?.table?.find((row) => row.team?.id === TEAM_ID);

    if (!barcaStanding) {
      standingBox.innerHTML = `
        <strong>Nicht verfügbar</strong>
        <span>Die lokalen Daten enthalten aktuell keinen Tabellenplatz für FC Barcelona.</span>
      `;
      return;
    }

    standingBox.innerHTML = `
      <strong>#${barcaStanding.position} · ${escapeHtml(barcaStanding.team.shortName || 'FC Barcelona')}</strong>
      <span>${barcaStanding.points} Punkte · ${barcaStanding.playedGames} Spiele</span>
      <span>${barcaStanding.won} Siege · ${barcaStanding.draw} Remis · ${barcaStanding.lost} Niederlagen</span>
      <span>Torverhältnis: ${barcaStanding.goalsFor}:${barcaStanding.goalsAgainst}</span>
    `;
  }

  /**
   * Zeigt den Zeitstempel der letzten Datenaktualisierung an.
   * @param {...object} payloads JSON-Datenblöcke
   */
  function showLastUpdated(...payloads) {
    const updatedAt = payloads
      .map((payload) => payload.generatedAt || payload.lastUpdated)
      .find(Boolean);

    if (!updatedAt) {
      showStatus('Daten geladen. Noch kein Aktualisierungszeitpunkt vorhanden.', 'success');
      return;
    }

    showStatus(`Daten geladen. Letzte Aktualisierung: ${formatMatchDate(updatedAt)}.`, 'success');
  }

  /**
   * Setzt die Karten in einen verständlichen Fallback-Zustand.
   */
  function renderFallbackState() {
    if (teamName) teamName.textContent = 'FC Barcelona';
    if (teamMeta) teamMeta.textContent = 'Daten werden nach dem ersten GitHub-Action-Lauf angezeigt.';

    renderMatches(nextMatches, [], 'Noch keine lokalen Spieldaten vorhanden.');
    renderMatches(lastMatches, [], 'Noch keine lokalen Resultate vorhanden.');

    if (standingBox) {
      standingBox.innerHTML = `
        <strong>Noch keine Daten</strong>
        <span>Starte den GitHub Workflow manuell oder warte auf den geplanten Lauf.</span>
      `;
    }
  }

  /* ------------------------------------------------------------
     Hilfsfunktionen
     ------------------------------------------------------------ */

  /**
   * Formatiert den Spielstand. Bei geplanten Spielen wird ein Trennzeichen angezeigt.
   * @param {object} match Match-Objekt
   * @returns {string} Formatierter Spielstand
   */
  function formatScore(match) {
    const home = match.score?.fullTime?.home;
    const away = match.score?.fullTime?.away;

    if (Number.isInteger(home) && Number.isInteger(away)) {
      return `${home}:${away}`;
    }

    return 'vs.';
  }

  /**
   * Formatiert ein UTC-Datum in eine deutsch-schweizerische Anzeige.
   * @param {string} utcDate UTC-Datum
   * @returns {string} Lesbares Datum
   */
  function formatMatchDate(utcDate) {
    if (!utcDate) return 'Datum offen';

    return new Intl.DateTimeFormat('de-CH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(utcDate));
  }

  /**
   * Übersetzt technische Match-Statuswerte in verständlichere Bezeichnungen.
   * @param {string} status API-Status
   * @returns {string} Deutsche Statusanzeige
   */
  function translateStatus(status) {
    const statusMap = {
      SCHEDULED: 'Geplant',
      TIMED: 'Terminiert',
      IN_PLAY: 'Live',
      PAUSED: 'Pause',
      FINISHED: 'Beendet',
      POSTPONED: 'Verschoben',
      SUSPENDED: 'Unterbrochen',
      CANCELED: 'Abgesagt',
    };

    return statusMap[status] || status || 'Status offen';
  }

  /**
   * Aktiviert oder deaktiviert den Ladezustand des Buttons.
   * @param {boolean} isLoading Ladezustand
   */
  function setLoadingState(isLoading) {
    loadButton.disabled = isLoading;
    loadButton.textContent = isLoading ? 'Daten werden geladen ...' : 'FC-Barcelona-Daten laden';
  }

  /**
   * Zeigt eine Statusmeldung im Football-Bereich an.
   * @param {string} message Nachricht
   * @param {string} type Status-Typ
   */
  function showStatus(message, type = 'info') {
    statusBox.textContent = message;
    statusBox.dataset.status = type;
  }

  /**
   * Schützt dynamische Inhalte vor HTML-Injection.
   * @param {unknown} value Eingabewert
   * @returns {string} Escaped HTML-Text
   */
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
