document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".v1_7 a");

  navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
      link.style.opacity = "0.8";
    });

    link.addEventListener("mouseleave", () => {
      link.style.opacity = "1";
    });
  });
});