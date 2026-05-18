/*
 * Football-Data API Integration
 *
 * Zweck:
 * - Lädt Live-Daten zum Lieblingsverein FC Barcelona.
 * - Verwendet die Football-Data API v4.
 * - Zeigt Clubdaten, kommende Spiele, letzte Resultate und – falls verfügbar – die Tabelle.
 *
 * Wichtiger Hinweis:
 * Ein API-Token sollte in produktiven Projekten nicht dauerhaft im Frontend gespeichert
 * oder im öffentlichen Repository veröffentlicht werden. Für ein echtes Deployment ist ein
 * kleines Backend oder eine Serverless Function als Proxy sicherer.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------
     Grundkonfiguration
     ------------------------------------------------------------ */

  // FC Barcelona ist in der Football-Data API als Team-ID 81 hinterlegt.
  const TEAM_ID = 81;

  // PD = Primera División / La Liga.
  const LA_LIGA_CODE = 'PD';

  // Basis-URL der Football-Data API v4.
  const API_BASE_URL = 'https://api.football-data.org/v4';

  // Optionaler Demo-Wert. Aus Sicherheitsgründen leer lassen.
  const DEFAULT_API_TOKEN = '';

  /* ------------------------------------------------------------
     DOM-Elemente aus der Freizeitseite
     ------------------------------------------------------------ */

  const tokenInput = document.getElementById('footballApiToken');
  const loadButton = document.getElementById('loadFootballData');
  const statusBox = document.getElementById('footballStatus');
  const crestBox = document.getElementById('footballCrest');
  const teamName = document.getElementById('footballTeamName');
  const teamMeta = document.getElementById('footballTeamMeta');
  const nextMatches = document.getElementById('footballNextMatches');
  const lastMatches = document.getElementById('footballLastMatches');
  const standingBox = document.getElementById('footballStanding');

  // Auf Seiten ohne Football-Bereich wird das Skript sofort beendet.
  if (!loadButton || !statusBox) return;

  restoreTokenFromSession();
  loadButton.addEventListener('click', loadFootballData);

  /* ------------------------------------------------------------
     Hauptfunktion: Daten laden und einzeln auswerten
     ------------------------------------------------------------ */

  /**
   * Lädt die Football-Daten.
   *
   * Diese Version ist robuster als eine einzelne Promise.all-Abfrage:
   * Wenn z. B. die Tabelle wegen Berechtigung oder Limit fehlschlägt,
   * werden Clubdaten und Spiele trotzdem angezeigt.
   */
  async function loadFootballData() {
    const token = getApiToken();

    if (!token) {
      showStatus('Bitte zuerst einen Football-Data-API-Token einfügen.', 'warning');
      return;
    }

    window.sessionStorage.setItem('footballDataToken', token);
    setLoadingState(true);
    showStatus('Live-Daten werden geladen ...', 'loading');

    const requests = {
      team: requestFootballData(`/teams/${TEAM_ID}`, token),
      next: requestFootballData(`/teams/${TEAM_ID}/matches?status=SCHEDULED&limit=3`, token),
      last: requestFootballData(`/teams/${TEAM_ID}/matches?status=FINISHED&limit=3`, token),
      standing: requestFootballData(`/competitions/${LA_LIGA_CODE}/standings`, token),
    };

    const results = await settleNamedRequests(requests);

    renderResult('team', results.team, renderTeam, () => {
      renderTeamFallback();
    });

    renderResult('next', results.next, (data) => {
      renderMatches(nextMatches, data.matches, 'Keine kommenden Spiele gefunden.');
    }, () => {
      renderListError(nextMatches, 'Kommende Spiele konnten nicht geladen werden.');
    });

    renderResult('last', results.last, (data) => {
      renderMatches(lastMatches, data.matches, 'Keine abgeschlossenen Spiele gefunden.');
    }, () => {
      renderListError(lastMatches, 'Letzte Resultate konnten nicht geladen werden.');
    });

    renderResult('standing', results.standing, renderStanding, () => {
      renderStandingError('Tabelle konnte nicht geladen werden.');
    });

    showSummaryStatus(results);
    setLoadingState(false);
  }

  /**
   * Wartet auf mehrere benannte Requests und gibt zu jedem Request den Status zurück.
   * @param {Record<string, Promise<object>>} requestMap Benannte API-Requests
   * @returns {Promise<Record<string, object>>} Ergebnisse mit status/value/reason
   */
  async function settleNamedRequests(requestMap) {
    const entries = Object.entries(requestMap);
    const settled = await Promise.allSettled(entries.map(([, request]) => request));

    return entries.reduce((accumulator, [name], index) => {
      accumulator[name] = settled[index];
      return accumulator;
    }, {});
  }

  /**
   * Rendert ein einzelnes Ergebnis, falls der Request erfolgreich war.
   * @param {string} name Name des Requests für Debugging
   * @param {PromiseSettledResult<object>} result Ergebnis von Promise.allSettled
   * @param {(value: object) => void} onSuccess Funktion bei Erfolg
   * @param {(reason: Error) => void} onError Funktion bei Fehler
   */
  function renderResult(name, result, onSuccess, onError) {
    if (result.status === 'fulfilled') {
      onSuccess(result.value);
      return;
    }

    console.warn(`Football-Data Request fehlgeschlagen: ${name}`, result.reason);
    onError(result.reason);
  }

  /* ------------------------------------------------------------
     API-Zugriff
     ------------------------------------------------------------ */

  /**
   * Führt eine GET-Anfrage an die Football-Data API aus.
   * @param {string} path API-Pfad nach der Basis-URL
   * @param {string} token Football-Data API Token
   * @returns {Promise<object>} JSON-Antwort der API
   */
  async function requestFootballData(path, token) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'GET',
        headers: {
          // Football-Data erwartet exakt diesen Headernamen.
          'X-Auth-Token': token,
        },
      });

      if (!response.ok) {
        throw new Error(await extractApiError(response));
      }

      return response.json();
    } catch (error) {
      // TypeError entsteht häufig bei Netzwerk-, CORS- oder Adblocker-Problemen.
      if (error instanceof TypeError) {
        throw new Error('Netzwerk- oder Browserfehler. Prüfe Internetverbindung, Adblocker und ob die Seite über einen lokalen Server läuft.');
      }

      throw error;
    }
  }

  /**
   * Versucht, eine aussagekräftige Fehlermeldung aus der API-Antwort zu lesen.
   * @param {Response} response Fetch-Response
   * @returns {Promise<string>} Fehlermeldung
   */
  async function extractApiError(response) {
    try {
      const data = await response.json();
      const apiMessage = data.message || data.error || response.statusText;
      return `${response.status} ${apiMessage}`;
    } catch {
      return `${response.status} ${response.statusText}`;
    }
  }

  /* ------------------------------------------------------------
     Token-Verwaltung
     ------------------------------------------------------------ */

  /**
   * Holt den Token aus dem Eingabefeld, aus der Session oder aus der optionalen Konstante.
   * @returns {string} API-Token oder leerer String
   */
  function getApiToken() {
    return (
      tokenInput?.value.trim() ||
      window.sessionStorage.getItem('footballDataToken') ||
      DEFAULT_API_TOKEN
    );
  }

  /**
   * Setzt einen vorhandenen Session-Token wieder ins Eingabefeld.
   */
  function restoreTokenFromSession() {
    const savedToken = window.sessionStorage.getItem('footballDataToken');

    if (tokenInput && savedToken) {
      tokenInput.value = savedToken;
    }
  }

  /* ------------------------------------------------------------
     Rendering: Clubdaten, Spiele, Tabelle
     ------------------------------------------------------------ */

  /**
   * Zeigt Basisinformationen zum Verein an.
   * @param {object} team Team-Antwort der API
   */
  function renderTeam(team) {
    if (teamName) {
      teamName.textContent = team.name || 'FC Barcelona';
    }

    if (teamMeta) {
      const founded = team.founded ? ` · gegründet ${team.founded}` : '';
      const venue = team.venue ? ` · ${team.venue}` : '';
      teamMeta.textContent = `${team.area?.name || 'Spanien'}${founded}${venue}`;
    }

    if (crestBox && team.crest) {
      crestBox.innerHTML = `<img src="${escapeHtml(team.crest)}" alt="Wappen von ${escapeHtml(team.name || 'FC Barcelona')}" />`;
      crestBox.classList.add('has-crest');
    }
  }

  /**
   * Fallback, falls die Clubdaten nicht geladen werden konnten.
   */
  function renderTeamFallback() {
    if (teamName) teamName.textContent = 'FC Barcelona';
    if (teamMeta) teamMeta.textContent = 'Clubdaten konnten nicht geladen werden.';
  }

  /**
   * Rendert eine Liste von Spielen.
   * @param {HTMLElement} target Ziel-Liste im HTML
   * @param {Array<object>} matches Spiele aus der API
   * @param {string} emptyText Text, falls keine Spiele vorhanden sind
   */
  function renderMatches(target, matches = [], emptyText) {
    if (!target) return;

    if (!matches.length) {
      target.innerHTML = `<li><span>${emptyText}</span></li>`;
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
            <span>${escapeHtml(competition)} · ${date}</span>
            <strong>${escapeHtml(homeTeam)} ${score} ${escapeHtml(awayTeam)}</strong>
            <small>${translateStatus(match.status)}</small>
          </li>
        `;
      })
      .join('');
  }

  /**
   * Zeigt eine Fehlermeldung in einer Match-Liste.
   * @param {HTMLElement} target Ziel-Liste im HTML
   * @param {string} message Fehlermeldung
   */
  function renderListError(target, message) {
    if (!target) return;
    target.innerHTML = `<li><span>${escapeHtml(message)}</span></li>`;
  }

  /**
   * Zeigt den aktuellen Tabellenplatz von FC Barcelona in La Liga.
   * @param {object} standings Tabellen-Antwort der API
   */
  function renderStanding(standings) {
    if (!standingBox) return;

    const totalStanding = standings.standings?.find((entry) => entry.type === 'TOTAL');
    const barcaStanding = totalStanding?.table?.find((row) => row.team?.id === TEAM_ID);

    if (!barcaStanding) {
      renderStandingError('Die API-Antwort enthält aktuell keinen Tabellenplatz für FC Barcelona.');
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
   * Zeigt eine Fehlermeldung im Tabellenbereich.
   * @param {string} message Fehlermeldung
   */
  function renderStandingError(message) {
    if (!standingBox) return;

    standingBox.innerHTML = `
      <strong>Nicht verfügbar</strong>
      <span>${escapeHtml(message)}</span>
    `;
  }

  /* ------------------------------------------------------------
     Status- und Hilfsfunktionen
     ------------------------------------------------------------ */

  /**
   * Zeigt eine Zusammenfassung der erfolgreichen und fehlgeschlagenen Requests.
   * @param {Record<string, PromiseSettledResult<object>>} results API-Ergebnisse
   */
  function showSummaryStatus(results) {
    const failed = Object.entries(results).filter(([, result]) => result.status === 'rejected');

    if (!failed.length) {
      showStatus('Live-Daten erfolgreich geladen.', 'success');
      return;
    }

    const details = failed
      .map(([name, result]) => `${translateRequestName(name)}: ${result.reason.message}`)
      .join(' · ');

    showStatus(`Ein Teil der Live-Daten konnte nicht geladen werden. ${details}`, 'warning');
  }

  /**
   * Aktualisiert den Statushinweis oberhalb der Datenkarten.
   * @param {string} message Hinweistext
   * @param {'loading'|'success'|'warning'|'error'} type Statusart
   */
  function showStatus(message, type = 'loading') {
    statusBox.textContent = message;
    statusBox.dataset.status = type;
  }

  /**
   * Verhindert Mehrfachklicks während des Ladens.
   * @param {boolean} isLoading Ob gerade Daten geladen werden
   */
  function setLoadingState(isLoading) {
    loadButton.disabled = isLoading;
    loadButton.textContent = isLoading ? 'Lädt ...' : 'Live-Daten laden';
  }

  /**
   * Übersetzt interne Request-Namen in lesbare Bezeichnungen.
   * @param {string} name Interner Request-Name
   * @returns {string} Lesbare Bezeichnung
   */
  function translateRequestName(name) {
    const labels = {
      team: 'Clubdaten',
      next: 'kommende Spiele',
      last: 'letzte Resultate',
      standing: 'Tabelle',
    };

    return labels[name] || name;
  }

  /**
   * Formatiert den Spielstand. Bei geplanten Spielen wird ein Trennzeichen angezeigt.
   * @param {object} match Match-Objekt der API
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
   * Formatiert das UTC-Datum in eine deutsch-schweizerische Anzeige.
   * @param {string} utcDate UTC-Datum aus der API
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
   * Einfache HTML-Escaping-Funktion für Daten aus externen Quellen.
   * @param {string} value Zu bereinigender Wert
   * @returns {string} HTML-sicherer Text
   */
  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
