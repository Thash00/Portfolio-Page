(function () {
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearChat');
  const quickReplies = document.getElementById('quickReplies');

  if (!chatMessages || !chatInput || !sendBtn) return;

  const facts = {
    kompetenzen: 'Thashaanths Schwerpunkte liegen in Windows- und Linux-Serveradministration, Microsoft 365, Application Management, Change- und Release-Management sowie agilen Arbeitsmethoden wie SAFe und Scrum.',
    erfahrung: 'Aktuell arbeitet Thashaanth als ICT Application Manager bei RUAG AG. Davor war er im IT-Support beim BBZ Biel-Bienne sowie im Zivildienst im IT-Support und als Teamleitung Multimedia tätig.',
    ausbildung: 'Er studiert Wirtschaftsinformatik / Digital Business & AI an der Berner Fachhochschule. Zuvor absolvierte er die Berufsmaturität und die Berufslehre als Informatiker EFZ Systemtechnik.',
    zertifikate: 'Er besitzt unter anderem das Zertifikat Certified SAFe 6 Agilist, gültig bis 16. Oktober 2026. Zusätzlich sind sein EFZ-Fähigkeitszeugnis und das Berufsmaturitätszeugnis eingebunden.',
    freizeit: 'In seiner Freizeit interessiert sich Thashaanth für Fitness, Fussball und Autos. Diese Interessen stehen für Disziplin, Teamgeist, Technikbegeisterung und Fokus.',
    kontakt: 'Du erreichst Thashaanth per E-Mail unter thashaanth@hotmail.com oder telefonisch unter 078 630 70 09. Sein LinkedIn-Profil ist ebenfalls auf der Startseite verlinkt.'
  };

  function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'user' ? 'Du' : '🤖';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    msg.append(avatar, bubble);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function answerFor(text) {
    const q = text.toLowerCase();
    if (q.includes('skill') || q.includes('kompetenz') || q.includes('fähigkeit') || q.includes('techn')) return facts.kompetenzen;
    if (q.includes('beruf') || q.includes('erfahrung') || q.includes('ruag') || q.includes('arbeit')) return facts.erfahrung;
    if (q.includes('ausbildung') || q.includes('studium') || q.includes('bachelor') || q.includes('efz')) return facts.ausbildung;
    if (q.includes('zertifikat') || q.includes('safe') || q.includes('zeugnis')) return facts.zertifikate;
    if (q.includes('freizeit') || q.includes('hobby') || q.includes('fitness') || q.includes('fussball') || q.includes('auto')) return facts.freizeit;
    if (q.includes('kontakt') || q.includes('email') || q.includes('telefon') || q.includes('linkedin')) return facts.kontakt;
    return 'Dazu habe ich keine spezifische Information im Portfolio. Relevant sind vor allem Lebenslauf, ICT-Kompetenzen, Zertifikate, Kontakt und Freizeit. Du kannst auch direkt nach RUAG, SAFe, EFZ, Fitness, Fussball oder Autos fragen.';
  }

  function sendMessage(userText) {
    const text = userText.trim();
    if (!text) return;
    if (quickReplies) quickReplies.style.display = 'none';
    appendMessage('user', text);
    chatInput.value = '';
    sendBtn.disabled = true;
    window.setTimeout(() => {
      appendMessage('bot', answerFor(text));
      sendBtn.disabled = false;
      chatInput.focus();
    }, 250);
  }

  sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(chatInput.value);
    }
  });
  document.querySelectorAll('.quick-btn').forEach((btn) => btn.addEventListener('click', () => sendMessage(btn.dataset.msg || '')));
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      while (chatMessages.children.length > 1) chatMessages.removeChild(chatMessages.lastChild);
      if (quickReplies) {
        quickReplies.style.display = 'flex';
        chatMessages.appendChild(quickReplies);
      }
    });
  }
  [document.getElementById('chatLink'), document.getElementById('heroChat')].forEach((link) => {
    if (!link) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('chatbot')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => chatInput.focus(), 500);
    });
  });
})();
