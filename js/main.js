// =========================================================
// main.js – Portfolio Funktionen + Darkmode
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

  // -----------------------------
  // Darkmode (Toggle + Speicherung)
  // -----------------------------
  const root = document.documentElement; // <html>
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme){
    const isDark = theme === 'dark';

    if (isDark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');

    // Button-UI (falls vorhanden)
    if (themeToggle){
      themeToggle.textContent = isDark ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeToggle.setAttribute('title', isDark ? 'Lightmode aktivieren' : 'Darkmode aktivieren');
      themeToggle.setAttribute('aria-label', isDark ? 'Lightmode aktivieren' : 'Darkmode aktivieren');
    }
  }

  // Initial: saved > system preference > light
  const savedTheme = localStorage.getItem('theme'); // 'light' | 'dark' | null
  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  if (themeToggle){
    themeToggle.addEventListener('click', () => {
      const currentlyDark = root.getAttribute('data-theme') === 'dark';
      const nextTheme = currentlyDark ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      applyTheme(nextTheme);
    });
  }

  // -----------------------------
  // Footer: aktuelles Jahr
  // -----------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -----------------------------
  // Quote (quotable.io)
  // -----------------------------
  const quoteEl = document.getElementById('quote');
  const newQuoteBtn = document.getElementById('newQuote');

  async function fetchQuote(){
    if (!quoteEl) return;

    quoteEl.textContent = 'Lade Zitat…';

    try{
      const res = await fetch('https://api.quotable.io/random');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      quoteEl.textContent = `"${data.content}" — ${data.author}`;
    }catch(e){
      quoteEl.textContent = 'Zitat konnte nicht geladen werden.';
      console.error('Quote Fehler:', e);
    }
  }

  if (newQuoteBtn) newQuoteBtn.addEventListener('click', fetchQuote);
  fetchQuote();

  // -----------------------------
  // Kontaktformular (lokaler Demo-Handler)
  // -----------------------------
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);

      // Erfolgsmeldung anzeigen
      if (formSuccess) formSuccess.classList.remove('hidden');

      // Demo: Daten in Konsole loggen
      console.log('Kontaktformular (lokal):', Object.fromEntries(formData.entries()));

      contactForm.reset();
    });
  }
});