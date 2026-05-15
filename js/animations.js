(function () {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const skillCards = document.querySelectorAll('.skill-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if (entry.target.matches('.stat-num')) animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  function animateCounter(el) {
    const target = Number(el.dataset.target || 0);
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * progress);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  counters.forEach((el) => observer.observe(el));
  skillCards.forEach((el) => observer.observe(el));
})();
