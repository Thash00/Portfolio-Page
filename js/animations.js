/*
 * Animationen
 * Aktiviert Zähler und Skill-Balken erst, wenn sie im sichtbaren Bereich sind.
 */
(function () {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const skillCards = document.querySelectorAll('.skill-card');

  /**
   * IntersectionObserver schont Ressourcen, weil Animationen nur bei Sichtbarkeit starten.
   */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('visible');

        if (entry.target.matches('.stat-num')) {
          animateCounter(entry.target);
        }

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35 }
  );

  /**
   * Zählt eine Kennzahl von 0 bis zum Wert im data-target-Attribut hoch.
   * @param {HTMLElement} element Kennzahlen-Element im Hero-Bereich
   */
  function animateCounter(element) {
    const target = Number(element.dataset.target || 0);
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      element.textContent = Math.round(target * progress);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  counters.forEach((element) => observer.observe(element));
  skillCards.forEach((element) => observer.observe(element));
})();
