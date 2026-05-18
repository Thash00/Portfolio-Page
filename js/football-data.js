/*
 * FC Barcelona Daten für GitHub Pages
 *
 * Diese Datei lädt keine Daten direkt von Football-Data.
 * Stattdessen liest sie lokale JSON-Dateien aus `data/football`.
 * Die JSON-Dateien werden durch GitHub Actions aktualisiert.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     Grundkonfiguration
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
     DOM-Elemente
     ------------------------------------------------------------ */

  const loadButton = document.getElementById('loadFootballData');
  const statusBox = document.getElementById('footballStatus');
  const crestBox = document.getElementById('footballCrest');
  const teamName = document.getElementById('footballTeamName');
  const teamMeta = document.getElementById('footballTeamMeta');
  const nextMatches = document.getElementById('footballNextMatches');
  const lastMatches = document.getElementById('footballLastMatches');
  const standingBox = document.getElementById('footballStanding');

  // Auf Seiten ohne Football-Bereich wird das Skript nicht ausgeführt.
  if (!loadButton || !statusBox) return;

  loadButton.addEventListener('click', loadFootballData);

  // Daten werden automatisch geladen, sobald die Freizeitseite geöffnet wird.
  loadFootballData();

  /* ------------------------------------------------------------
     Daten laden
     ------------------------------------------------------------ */

  async function loadFootballData() {
    setLoadingState(true);
    showStatus('FC-Barcelona-Daten werden aus lokalen JSON-Dateien geladen ...', 'loading');

    const [team, scheduledMatches, finishedMatches, standings] = await Promise.all([
      fetchJsonSafely(DATA_FILES.team),
      fetchJsonSafely(DATA_FILES.next),
      fetchJsonSafely(DATA_FILES.last),
      fetchJsonSafely(DATA_FILES.standing),
    ]);

    renderTeam(team);
    renderMatches(
      nextMatches,
      scheduledMatches,
      'Keine kommenden Spiele in den lokalen Daten gefunden.'
    );
    renderMatches(
      lastMatches,
      finishedMatches,
      'Keine letzten Resultate in den lokalen Daten gefunden.'
    );
    renderStanding(standings);
    showSummaryStatus(team, scheduledMatches, finishedMatches, standings);

    setLoadingState(false);
  }

  /**
   * Lädt eine JSON-Datei. Fehler werden nicht geworfen, sondern als Objekt zurückgegeben.
   * Dadurch kann die Seite einzelne fehlerhafte Bereiche anzeigen, ohne komplett abzubrechen.
   */
  async function fetchJsonSafely(path) {
    try {
      const response = await fetch(path, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-cache',
      });

      if (!response.ok) {
        return {
          ok: false,
          endpoint: path,
          status: response.status,
          error: `${path} konnte nicht geladen werden`,
          matches: [],
          standings: [],
        };
      }

      const payload = await response.json();
      return payload || { ok: false, endpoint: path, error: 'Leere JSON-Datei' };
    } catch (error) {
      return {
        ok: false,
        endpoint: path,
        error: error.message,
        matches: [],
        standings: [],
      };
    }
  }

  /* ------------------------------------------------------------
     Rendering
     ------------------------------------------------------------ */

  function renderTeam(team) {
    if (team?.ok === false) {
      if (teamName) teamName.textContent = 'FC Barcelona';
      if (teamMeta) teamMeta.textContent = `Clubdaten konnten nicht geladen werden: ${team.error || 'unbekannter Fehler'}`;
      return;
    }

    if (teamName) {
      teamName.textContent = team?.name || 'FC Barcelona';
    }

    if (teamMeta) {
      const country = team?.area?.name || 'Spanien';
      const founded = team?.founded ? ` · gegründet ${team.founded}` : '';
      const venue = team?.venue ? ` · ${team.venue}` : '';
      teamMeta.textContent = `${country}${founded}${venue}`;
    }

    if (crestBox && team?.crest) {
      crestBox.innerHTML = `<img src="${escapeHtml(team.crest)}" alt="Wappen von ${escapeHtml(team.name || 'FC Barcelona')}" />`;
      crestBox.classList.add('has-crest');
    }
  }

  function renderMatches(target, payload, emptyText) {
    if (!target) return;

    if (payload?.ok === false) {
      target.innerHTML = `
        <li>
          <span>Fehler beim Laden</span>
          <strong>${escapeHtml(readableError(payload))}</strong>
          <small>Details stehen in der JSON-Datei unter data/football.</small>
        </li>
      `;
      return;
    }

    const matches = Array.isArray(payload?.matches) ? payload.matches : [];

    if (!matches.length) {
      target.innerHTML = `<li><span>${escapeHtml(emptyText)}</span></li>`;
      return;
    }

    target.innerHTML = matches.map(renderMatchItem).join('');
  }

  function renderMatchItem(match) {
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
  }

  function renderStanding(standings) {
    if (!standingBox) return;

    if (standings?.ok === false) {
      standingBox.innerHTML = `
        <strong>Tabelle konnte nicht geladen werden</strong>
        <span>${escapeHtml(readableError(standings))}</span>
        <span>Prüfe die Datei data/football/barcelona-standings.json.</span>
      `;
      return;
    }

    const totalStanding = standings?.standings?.find((entry) => entry.type === 'TOTAL');
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

  function showSummaryStatus(...payloads) {
    const failedPayloads = payloads.filter((payload) => payload?.ok === false);

    if (failedPayloads.length > 0) {
      showStatus(
        `${failedPayloads.length} Datenbereich(e) konnten nicht geladen werden. Öffne die JSON-Dateien in data/football, um den exakten API-Fehler zu sehen.`,
        'error'
      );
      return;
    }

    const updatedAt = payloads
      .map((payload) => payload?.generatedAt || payload?.lastUpdated)
      .find(Boolean);

    if (updatedAt) {
      showStatus(`Daten geladen. Letzte Aktualisierung: ${formatMatchDate(updatedAt)}.`, 'success');
    } else {
      showStatus('Daten geladen. Es ist noch kein Aktualisierungszeitpunkt vorhanden.', 'success');
    }
  }

  /* ------------------------------------------------------------
     Hilfsfunktionen
     ------------------------------------------------------------ */

  function formatScore(match) {
    const home = match.score?.fullTime?.home;
    const away = match.score?.fullTime?.away;

    if (Number.isInteger(home) && Number.isInteger(away)) {
      return `${home}:${away}`;
    }

    return 'vs.';
  }

  function formatMatchDate(utcDate) {
    if (!utcDate) return 'Datum offen';

    return new Intl.DateTimeFormat('de-CH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(utcDate));
  }

  function translateStatus(status) {
    const labels = {
      SCHEDULED: 'geplant',
      TIMED: 'terminiert',
      IN_PLAY: 'läuft',
      PAUSED: 'Pause',
      FINISHED: 'beendet',
      POSTPONED: 'verschoben',
      CANCELLED: 'abgesagt',
    };

    return labels[status] || status || 'Status offen';
  }

  function readableError(payload) {
    const status = payload.status ? `HTTP ${payload.status}: ` : '';
    const message = payload.message || payload.error || 'unbekannter Fehler';
    return `${status}${message}`;
  }

  function setLoadingState(isLoading) {
    loadButton.disabled = isLoading;
    loadButton.textContent = isLoading ? 'Daten werden geladen ...' : 'FC-Barcelona-Daten laden';
  }

  function showStatus(message, type) {
    statusBox.textContent = message;
    statusBox.className = `football-status is-${type}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
