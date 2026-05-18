/*
 * Navigation
 * Steuert das fixe Menü, den mobilen Menü-Button und den Scroll-Zustand.
 */
(function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  /**
   * Hebt die Navigation optisch hervor, sobald die Seite leicht gescrollt wurde.
   */
  function updateNavigationBackground() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }

  /**
   * Öffnet oder schließt das mobile Menü.
   */
  function toggleMobileMenu() {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  }

  /**
   * Schließt das mobile Menü nach einem Klick auf einen Link.
   */
  function closeMobileMenu() {
    toggle.classList.remove('open');
    links.classList.remove('open');
  }

  if (toggle && links) {
    toggle.addEventListener('click', toggleMobileMenu);
    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  window.addEventListener('scroll', updateNavigationBackground, { passive: true });
  updateNavigationBackground();
})();
