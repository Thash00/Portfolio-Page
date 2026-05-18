/*
 * Portfolio-Chatbot
 * Ein lokaler Demo-Assistent, der ohne externe API funktioniert.
 * Die Antworten basieren auf vordefinierten Fakten aus dem Portfolio.
 */
(function () {
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearChat');
  const quickReplies = document.getElementById('quickReplies');

  // Auf Unterseiten ohne Chatbot wird das Skript sofort beendet.
  if (!chatMessages || !chatInput || !sendBtn) return;

  /**
   * Wissensbasis des Demo-Chatbots.
   * Für eine echte KI-API könnte dieser Bereich später durch API-Antworten ersetzt werden.
   */
  const facts = {
    kompetenzen:
      'Thashaanths Schwerpunkte liegen in Windows- und Linux-Serveradministration, Microsoft 365, Application Management, Change- und Release-Management sowie agilen Arbeitsmethoden wie SAFe und Scrum.',
    erfahrung:
      'Aktuell arbeitet Thashaanth als ICT Application Manager bei RUAG AG. Davor war er im IT-Support beim BBZ Biel-Bienne sowie im Zivildienst im IT-Support und als Teamleitung Multimedia tätig.',
    ausbildung:
      'Er studiert Wirtschaftsinformatik / Digital Business & AI an der Berner Fachhochschule. Zuvor absolvierte er die Berufsmaturität und die Berufslehre als Informatiker EFZ Systemtechnik.',
    zertifikate:
      'Er besitzt unter anderem das Zertifikat Certified SAFe 6 Agilist, gültig bis 16. Oktober 2026. Zusätzlich sind sein EFZ-Fähigkeitszeugnis und das Berufsmaturitätszeugnis eingebunden.',
    freizeit:
      'In seiner Freizeit interessiert sich Thashaanth für Fitness, Fussball und Autos. Sein Lieblingsverein ist der FC Barcelona. Diese Interessen stehen für Disziplin, Teamgeist, Technikbegeisterung und Fokus.',
    fussball:
      'Thashaanths Lieblingsverein ist der FC Barcelona. Auf der Freizeitseite ist eine Football-Data-API-Integration vorbereitet, über die mit einem API-Token aktuelle Spiele und Tabelleninformationen geladen werden können.',
    kontakt:
      'Du erreichst Thashaanth per E-Mail unter thashaanth@hotmail.com oder telefonisch unter 078 630 70 09. Sein LinkedIn-Profil ist ebenfalls auf der Startseite verlinkt.',
  };

  /**
   * Fügt eine neue Chatnachricht in den Nachrichtenbereich ein.
   * @param {'user'|'bot'} role Absender der Nachricht
   * @param {string} text Inhalt der Nachricht
   */
  function appendMessage(role, text) {
    const message = document.createElement('div');
    message.className = `msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'user' ? 'Du' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;

    message.append(avatar, bubble);
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Ermittelt anhand einfacher Schlüsselwörter die passende Antwort.
   * @param {string} text Eingabe des Besuchers
   * @returns {string} Antworttext des Assistenten
   */
  function answerFor(text) {
    const question = text.toLowerCase();

    if (matchesAny(question, ['skill', 'kompetenz', 'fähigkeit', 'techn'])) {
      return facts.kompetenzen;
    }

    if (matchesAny(question, ['beruf', 'erfahrung', 'ruag', 'arbeit'])) {
      return facts.erfahrung;
    }

    if (matchesAny(question, ['ausbildung', 'studium', 'bachelor', 'efz'])) {
      return facts.ausbildung;
    }

    if (matchesAny(question, ['zertifikat', 'safe', 'zeugnis'])) {
      return facts.zertifikate;
    }

    if (matchesAny(question, ['barcelona', 'barça', 'barca', 'lieblingsverein', 'la liga'])) {
      return facts.fussball;
    }

    if (matchesAny(question, ['freizeit', 'hobby', 'fitness', 'fussball', 'auto'])) {
      return facts.freizeit;
    }

    if (matchesAny(question, ['kontakt', 'email', 'telefon', 'linkedin'])) {
      return facts.kontakt;
    }

    return 'Dazu habe ich keine spezifische Information im Portfolio. Relevant sind vor allem Lebenslauf, ICT-Kompetenzen, Zertifikate, Kontakt und Freizeit. Du kannst auch direkt nach RUAG, SAFe, EFZ, Fitness, Fussball, FC Barcelona oder Autos fragen.';
  }

  /**
   * Prüft, ob ein Text eines der gesuchten Schlüsselwörter enthält.
   * @param {string} text Zu prüfender Text
   * @param {string[]} keywords Schlüsselwörter
   * @returns {boolean}
   */
  function matchesAny(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }

  /**
   * Verarbeitet eine Nutzereingabe und simuliert eine kurze Antwortverzögerung.
   * @param {string} userText Eingabe aus dem Chatfeld oder Quick-Reply-Button
   */
  function sendMessage(userText) {
    const text = userText.trim();
    if (!text) return;

    if (quickReplies) {
      quickReplies.style.display = 'none';
    }

    appendMessage('user', text);
    chatInput.value = '';
    sendBtn.disabled = true;

    window.setTimeout(() => {
      appendMessage('bot', answerFor(text));
      sendBtn.disabled = false;
      chatInput.focus();
    }, 250);
  }

  // Nachricht per Button senden.
  sendBtn.addEventListener('click', () => sendMessage(chatInput.value));

  // Nachricht per Enter senden. Shift+Enter bleibt für Zeilenumbrüche reserviert.
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(chatInput.value);
    }
  });

  // Vorgefertigte Fragen im Chatbereich.
  document.querySelectorAll('.quick-btn').forEach((button) => {
    button.addEventListener('click', () => sendMessage(button.dataset.msg || ''));
  });

  // Chat zurücksetzen und Quick Replies wieder anzeigen.
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      while (chatMessages.children.length > 1) {
        chatMessages.removeChild(chatMessages.lastChild);
      }

      if (quickReplies) {
        quickReplies.style.display = 'flex';
        chatMessages.appendChild(quickReplies);
      }
    });
  }

  // Links zum Chat scrollen weich in den Chatbot-Bereich.
  [document.getElementById('chatLink'), document.getElementById('heroChat')].forEach((link) => {
    if (!link) return;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('chatbot')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => chatInput.focus(), 500);
    });
  });
})();
