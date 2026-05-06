// chatbot.js – KI-Chatbot powered by Claude API

(function () {
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearChat');
  const quickReplies = document.getElementById('quickReplies');

  if (!chatMessages || !chatInput || !sendBtn) return;

  // Conversation history for multi-turn context
  const history = [];

  const SYSTEM_PROMPT = `Du bist der persönliche Portfolio-Assistent von Alex Müller, einem Webentwickler aus Bern, Schweiz. Du sprichst Deutsch und bist freundlich, kompetent und kurz gefasst.

Hier sind Fakten über Alex:
- Name: Alex Müller, 25 Jahre alt, wohnhaft in Bern
- Beruf: Junior Frontend Developer bei der Digital Agency Bern AG (seit 2024)
- Ausbildung: B.Sc. Business Information Technology an der BFH (2022–2025), EFZ Informatiker (Swisscom, 2017–2021)
- Fähigkeiten: HTML5, CSS3, JavaScript, React, Node.js, Python, Git, REST APIs, Figma, Docker
- Projekte: ShopWave (E-Commerce mit React/Node.js), Analytics Pro (Dashboard mit D3.js), GreenTrack (PWA)
- Freizeit: Klettern/Bouldern (3x/Woche, 7a-Niveau), Fotografie (Sony Alpha 7C II), Gaming (Indie Games, Retro), Lesen (Clean Code, Pragmatic Programmer), Kochen, Reisen (Japan, Portugal, Schweden)
- Haustier: Golden Retriever "Pixel"
- Sprachen: Deutsch (Muttersprache), Englisch (C1), Französisch (B1)
- Kontakt: alex.mueller@example.com
- GitHub: alexmüller.github.io

Beantworte Fragen kurz und präzise (2–4 Sätze). Verwende gelegentlich Emojis. Wenn du etwas nicht weisst, sage es ehrlich. Leite bei passenden Fragen auf die Seiten "Lebenslauf" oder "Freizeit" weiter.`;

  // Append message to chat
  function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.classList.add('msg', role === 'user' ? 'user-msg' : 'bot-msg');

    const avatar = document.createElement('div');
    avatar.classList.add('msg-avatar');
    avatar.textContent = role === 'user' ? 'Du' : '🤖';

    const bubble = document.createElement('div');
    bubble.classList.add('msg-bubble');
    bubble.textContent = text;

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
  }

  // Show typing indicator
  function showTyping() {
    const msg = document.createElement('div');
    msg.classList.add('msg', 'bot-msg', 'typing-indicator');
    msg.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.classList.add('msg-avatar');
    avatar.textContent = '🤖';

    const bubble = document.createElement('div');
    bubble.classList.add('msg-bubble');
    [0, 1, 2].forEach(i => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      bubble.appendChild(dot);
    });

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
  }

  // Hide quick replies after first use
  function hideQuickReplies() {
    if (quickReplies) {
      quickReplies.style.display = 'none';
    }
  }

  // Send message to Claude API
  async function sendMessage(userText) {
    if (!userText.trim()) return;

    hideQuickReplies();
    appendMessage('user', userText);
    history.push({ role: 'user', content: userText });

    chatInput.value = '';
    sendBtn.disabled = true;
    showTyping();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await response.json();
      removeTyping();

      if (data.content && data.content[0] && data.content[0].text) {
        const reply = data.content[0].text;
        appendMessage('bot', reply);
        history.push({ role: 'assistant', content: reply });
      } else {
        appendMessage('bot', 'Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es nochmal.');
      }
    } catch (error) {
      removeTyping();
      appendMessage('bot', 'Es gab einen Verbindungsfehler. Bitte überprüfe deine Internetverbindung und versuche es erneut. 🔌');
      console.error('Chatbot error:', error);
    }

    sendBtn.disabled = false;
    chatInput.focus();
  }

  // Event listeners
  sendBtn.addEventListener('click', () => {
    sendMessage(chatInput.value);
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(chatInput.value);
    }
  });

  // Quick reply buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sendMessage(btn.getAttribute('data-msg'));
    });
  });

  // Clear chat
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // Keep only the first bot message
      while (chatMessages.children.length > 1) {
        chatMessages.removeChild(chatMessages.lastChild);
      }
      history.length = 0;
      // Re-show quick replies
      if (quickReplies) {
        quickReplies.style.display = 'flex';
        chatMessages.appendChild(quickReplies);
      }
    });
  }

  // Scroll to chatbot when nav link is clicked
  const chatLink = document.getElementById('chatLink');
  const heroChatLink = document.getElementById('heroChat');
  [chatLink, heroChatLink].forEach(link => {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const chatSection = document.getElementById('chatbot');
        if (chatSection) {
          chatSection.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => chatInput.focus(), 600);
        }
      });
    }
  });
})();
