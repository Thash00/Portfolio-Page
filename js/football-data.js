/*
 * Football-Data API Integration
 *
 * Zweck:
 * - Lädt Live-Daten zum Lieblingsverein FC Barcelona.
 * - Verwendet die Football-Data API v4.
 * - Funktioniert ohne Token als Demo-Ansicht und mit Token als Live-Ansicht.
 *
 * Sicherheitshinweis:
 * Einen echten API-Token sollte man in produktiven Projekten nicht dauerhaft
 * im Frontend speichern oder veröffentlichen. Besser ist ein kleines Backend,
 * das den Token schützt und die API-Anfrage stellvertretend ausführt.
 */
(function () {
  // FC Barcelona ist in der Football-Data API als Team-ID 81 hinterlegt.
  const TEAM_ID = 81;
  const LA_LIGA_CODE = 'PD';
  const API_BASE_URL = 'https://api.football-data.org/v4';

  // Optionaler Demo-Wert. Aus Sicherheitsgründen leer lassen und den Token im Formular eingeben.
  const DEFAULT_API_TOKEN = '';

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

  /**
   * Lädt alle Live-Daten für FC Barcelona.
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

    try {
      const [team, scheduledMatches, finishedMatches, standings] = await Promise.all([
        requestFootballData(`/teams/${TEAM_ID}`, token),
        requestFootballData(`/teams/${TEAM_ID}/matches?status=SCHEDULED&limit=3`, token),
        requestFootballData(`/teams/${TEAM_ID}/matches?status=FINISHED&limit=3`, token),
        requestFootballData(`/competitions/${LA_LIGA_CODE}/standings`, token),
      ]);

      renderTeam(team);
      renderMatches(nextMatches, scheduledMatches.matches, 'Keine kommenden Spiele gefunden.');
      renderMatches(lastMatches, finishedMatches.matches, 'Keine abgeschlossenen Spiele gefunden.');
      renderStanding(standings);

      showStatus('Live-Daten erfolgreich geladen.', 'success');
    } catch (error) {
      console.error('Football-Data API Fehler:', error);
      showStatus(
        `Live-Daten konnten nicht geladen werden: ${error.message}. Prüfe Token, API-Limit oder CORS.`,
        'error'
      );
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Führt eine GET-Anfrage an die Football-Data API aus.
   * @param {string} path API-Pfad nach der Basis-URL
   * @param {string} token Football-Data API Token
   * @returns {Promise<object>} JSON-Antwort der API
   */
  async function requestFootballData(path, token) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': token,
      },
    });

    if (!response.ok) {
      throw new Error(await extractApiError(response));
    }

    return response.json();
  }

  /**
   * Versucht, eine aussagekräftige Fehlermeldung aus der API-Antwort zu lesen.
   * @param {Response} response Fetch-Response
   * @returns {Promise<string>} Fehlermeldung
   */
  async function extractApiError(response) {
    try {
      const data = await response.json();
      return data.message || `${response.status} ${response.statusText}`;
    } catch {
      return `${response.status} ${response.statusText}`;
    }
  }

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
   * Zeigt den aktuellen Tabellenplatz von FC Barcelona in La Liga.
   * @param {object} standings Tabellen-Antwort der API
   */
  function renderStanding(standings) {
    if (!standingBox) return;

    const totalStanding = standings.standings?.find((entry) => entry.type === 'TOTAL');
    const barcaStanding = totalStanding?.table?.find((row) => row.team?.id === TEAM_ID);

    if (!barcaStanding) {
      standingBox.innerHTML = `
        <strong>Kein Tabellenplatz gefunden</strong>
        <span>Die API-Antwort enthält aktuell keinen Eintrag für FC Barcelona.</span>
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
