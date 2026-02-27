// main.js – functions for the portfolio site
document.addEventListener('DOMContentLoaded', () => {
  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Quote fetcher (uses quotable.io)
  const quoteEl = document.getElementById('quote');
  const newQuoteBtn = document.getElementById('newQuote');

  async function fetchQuote(){
    if (!quoteEl) return;
    quoteEl.textContent = 'Lade Zitat…';
    try{
      const res = await fetch('https://api.quotable.io/random');
      const data = await res.json();
      quoteEl.textContent = `"${data.content}" — ${data.author}`;
    }catch(e){
      quoteEl.textContent = 'Zitat konnte nicht geladen werden.';
      console.error(e);
    }
  }

  if (newQuoteBtn) newQuoteBtn.addEventListener('click', fetchQuote);
  fetchQuote();

  // Contact form (local demo handler)
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      // For now: show success message and log data to console
      if (formSuccess) formSuccess.classList.remove('hidden');
      console.log('Kontaktformular (lokal):', Object.fromEntries(formData.entries()));
      contactForm.reset();
    });
  }
});
