(function () {
  function isDarkMode() {
    return document.documentElement.classList.contains("theme-dark");
  }

  function isHomePage() {
    var path = window.location.pathname;
    return path === "/" || path === "/index.html";
  }

  function isProjectPage() {
    return window.location.pathname.indexOf("/projects/") !== -1;
  }

  function getThemeColorFallback(isDark) {
    if (isDark) {
      if (isHomePage() || isProjectPage()) return "#1a2026";
      return "#14171a";
    }

    if (isHomePage()) return "#0f4e9a";
    if (window.location.pathname.indexOf("/projects/darkmode") !== -1) return "#1a2026";
    return "#ebf1f5";
  }

  function readNavColor() {
    var nav = document.querySelector(".nav-bar");
    if (!nav) return null;

    var bg = window.getComputedStyle(nav).backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") return null;
    return bg;
  }

  function getThemeColor() {
    return readNavColor() || getThemeColorFallback(isDarkMode());
  }

  function setMetaThemeColor(color) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }

  function ensureChromeTint() {
    var tint = document.getElementById("safari-chrome-tint");
    if (!tint && document.body) {
      tint = document.createElement("div");
      tint.id = "safari-chrome-tint";
      tint.setAttribute("aria-hidden", "true");
      document.body.insertBefore(tint, document.body.firstChild);
    }
    return tint;
  }

  function updateThemeColor() {
    var color = getThemeColor();
    setMetaThemeColor(color);
    document.documentElement.style.setProperty("--chrome-tint", color);

    var tint = ensureChromeTint();
    if (!tint) return;

    tint.style.backgroundColor = color;

    var nav = document.querySelector(".nav-bar");
    if (nav) {
      tint.style.height = Math.max(nav.getBoundingClientRect().height, 8) + "px";
    }
  }

  window.updateThemeColor = updateThemeColor;
  setMetaThemeColor(getThemeColorFallback(isDarkMode()));
  document.addEventListener("DOMContentLoaded", updateThemeColor);
  window.addEventListener("resize", updateThemeColor);
})();
