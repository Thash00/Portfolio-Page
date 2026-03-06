document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const button = document.querySelector('.menu-button');
  const links = document.querySelectorAll('.navigation a');

  if (!header || !button) return;

  button.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  links.forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    });
  });
});
