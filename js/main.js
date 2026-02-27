// main.js – Portfolio Funktionen + Darkmode + Zitat API
document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // 1) DARKMODE (Toggle + Speicherung in localStorage)
  // Voraussetzung im HTML (z.B. im Header):
  // <button id="themeToggle" class="theme-toggle" type="button" aria-label="Darkmode umschalten">🌙</button>
  // =========================================================
  const root = document.documentElement; // <html>
  const themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    const isDark = theme === "dark";

    if (isDark) root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");

    // Button-UI (falls vorhanden)
    if (themeToggle) {
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Lightmode aktivieren" : "Darkmode aktivieren"
      );
      themeToggle.title = isDark ? "Lightmode aktivieren" : "Darkmode aktivieren";
    }
  }

  // Initial: saved > system preference > light
  const savedTheme = localStorage.getItem("theme"); // "light" | "dark" | null
  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = savedTheme ? savedTheme : systemPrefersDark ? "dark" : "light";
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentlyDark = root.getAttribute("data-theme") === "dark";
      const nextTheme = currentlyDark ? "light" : "dark";
      localStorage.setItem("theme", nextTheme);
      applyTheme(nextTheme);
    });
  }

  // =========================================================
  // 2) FOOTER-JAHR
  // Voraussetzung im HTML: <span id="year"></span>
  // =========================================================
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // =========================================================
  // 3) ZITAT API (Quotable)
  // Voraussetzungen in index.html:
  // <blockquote id="quote">Lade Zitat…</blockquote>
  // <button id="newQuote">Neues Zitat</button>
  // =========================================================
  const quoteEl = document.getElementById("quote");
  const newQuoteBtn = document.getElementById("newQuote");

  async function fetchQuote() {
    if (!quoteEl) return;

    quoteEl.textContent = "Lade Zitat…";

    // Timeout, damit es nicht ewig hängt
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch("https://api.quotable.io/random", {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const content = data?.content ?? "";
      const author = data?.author ?? "Unbekannt";

      if (!content) throw new Error("Empty quote content");

      quoteEl.textContent = `"${content}" — ${author}`;
    } catch (err) {
      quoteEl.textContent = "Zitat konnte nicht geladen werden.";
      console.error("Quote error:", err);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (newQuoteBtn) newQuoteBtn.addEventListener("click", fetchQuote);
  fetchQuote(); // Beim Laden direkt ein Zitat holen (nur wenn #quote existiert)

  // =========================================================
  // 4) KONTAKTFORMULAR (lokaler Demo-Handler)
  // Voraussetzungen in kontakt.html:
  // <form id="contactForm">...</form>
  // <p id="formSuccess" class="hidden">...</p>
  // =========================================================
  const contactForm = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);

      // Erfolgsmeldung anzeigen (falls vorhanden)
      if (formSuccess) formSuccess.classList.remove("hidden");

      // Demo: Daten in Konsole loggen
      console.log("Kontaktformular (lokal):", Object.fromEntries(formData.entries()));

      contactForm.reset();
    });
  }
});