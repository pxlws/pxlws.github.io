function setHamburgerMenuOpen(isOpen) {
  var nav = document.querySelector(".hamburger");
  if (!nav) return;
  nav.classList.toggle("is-open", isOpen);
}

function myFunction() {
  var nav = document.querySelector(".hamburger");
  if (!nav) return;
  setHamburgerMenuOpen(!nav.classList.contains("is-open"));
}

var GALLERY_SIZE_KEY = "gallery-shot-size";
var THEME_KEY = "theme";

function setTheme(theme) {
  var isDark = theme === "dark";
  document.documentElement.classList.toggle("theme-dark", isDark);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}

  updateThemeToggleIcon();
  if (window.updateThemeColor) window.updateThemeColor();
}

function updateThemeToggleIcon() {
  var btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  var isDark = document.documentElement.classList.contains("theme-dark");
  var label = btn.querySelector(".theme-toggle-label");

  btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

  if (label) {
    label.textContent = isDark ? "Light mode" : "Dark mode";
  }
}

function isNavLinkActive(href) {
  var current = window.location.pathname.replace(/\/index\.html$/, "/");
  if (current.length > 1 && current.charAt(current.length - 1) === "/") {
    current = current.slice(0, -1);
  }
  if (!current) current = "/";

  var target;
  try {
    target = new URL(href, window.location.href).pathname.replace(/\/index\.html$/, "/");
    if (target.length > 1 && target.charAt(target.length - 1) === "/") {
      target = target.slice(0, -1);
    }
    if (!target) target = "/";
  } catch (e) {
    return false;
  }

  if (target === current) return true;

  if (target === "/") return current === "/";

  if (target === "/work" || href.indexOf("work") !== -1) {
    return current === "/work" || current.indexOf("/work") === 0;
  }

  if (href.indexOf("gallery") !== -1) {
    return current.indexOf("gallery") !== -1;
  }

  return false;
}

function initNavMenu() {
  var dropdown = document.getElementById("hamburger-dropdown");
  if (!dropdown || dropdown.dataset.enhanced) return;

  var linksList = dropdown.querySelector("ul");
  if (!linksList) return;

  var iconByLabel = {
    Home: "fa-home",
    Work: "fa-briefcase",
    Gallery: "fa-images",
  };

  linksList.classList.add("nav-menu-links");

  var links = linksList.querySelectorAll("a");
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var label = link.textContent.trim();
    var icon = iconByLabel[label] || "fa-circle";
    link.innerHTML =
      '<i class="fal ' + icon + '" aria-hidden="true"></i><span>' + label + "</span>";
    link.classList.add("nav-menu-item");

    if (isNavLinkActive(link.getAttribute("href"))) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  }

  var divider = document.createElement("div");
  divider.className = "nav-menu-divider";
  divider.setAttribute("role", "separator");

  var actionsList = document.createElement("ul");
  actionsList.className = "nav-menu-actions";

  dropdown.innerHTML = "";
  dropdown.appendChild(linksList);
  dropdown.appendChild(divider);
  dropdown.appendChild(actionsList);
  dropdown.dataset.enhanced = "true";
}

function initThemeToggle() {
  var menu = document.querySelector(".nav-menu-actions");
  if (!menu || document.querySelector(".theme-toggle")) return;

  var li = document.createElement("li");
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "theme-toggle nav-menu-item";
  btn.innerHTML =
    '<i class="fal fa-moon theme-icon-dark" aria-hidden="true"></i>' +
    '<i class="fal fa-sun theme-icon-light" aria-hidden="true"></i>' +
    '<span class="theme-toggle-label">Dark mode</span>';
  li.appendChild(btn);
  menu.appendChild(li);
  updateThemeToggleIcon();

  btn.addEventListener("click", function () {
    setTheme(
      document.documentElement.classList.contains("theme-dark") ? "light" : "dark"
    );

    setHamburgerMenuOpen(false);
  });
}

function updateGallerySizeThumb() {
  var controls = document.querySelector(".gallery-size-controls");
  if (!controls) return;

  var active = controls.querySelector(".gallery-size-btn.is-active");
  var thumb = controls.querySelector(".gallery-size-thumb");
  if (!active || !thumb) return;

  thumb.style.width = active.offsetWidth + "px";
  thumb.style.height = active.offsetHeight + "px";
  thumb.style.transform =
    "translate3d(" + active.offsetLeft + "px, " + active.offsetTop + "px, 0)";
}

function setGallerySize(size) {
  var container = document.getElementById("shots");
  if (!container) return;

  var displaySize = normalizeGallerySize(size);

  container.classList.remove("shots-size-small", "shots-size-medium", "shots-size-large");
  container.classList.add("shots-size-" + displaySize);

  var buttons = document.querySelectorAll(".gallery-size-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle("is-active", buttons[i].dataset.size === displaySize);
  }

  try {
    localStorage.setItem(GALLERY_SIZE_KEY, size);
  } catch (e) {}

  updateGallerySizeThumb();
}

function isGalleryMobile() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function normalizeGallerySize(size) {
  if (isGalleryMobile() && size === "small") {
    return "medium";
  }
  return size;
}

function initGallerySizeControls() {
  var container = document.getElementById("shots");
  if (!container) return;

  var savedSize = "medium";
  try {
    savedSize = localStorage.getItem(GALLERY_SIZE_KEY) || "medium";
  } catch (e) {}

  if (savedSize !== "small" && savedSize !== "medium" && savedSize !== "large") {
    savedSize = "medium";
  }

  setGallerySize(savedSize);

  var buttons = document.querySelectorAll(".gallery-size-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      setGallerySize(this.dataset.size);
    });
  }

  window.matchMedia("(max-width: 720px)").addEventListener("change", function () {
    var savedSize = "medium";
    try {
      savedSize = localStorage.getItem(GALLERY_SIZE_KEY) || "medium";
    } catch (e) {}
    setGallerySize(savedSize);
  });

  window.addEventListener("resize", updateGallerySizeThumb);
  requestAnimationFrame(updateGallerySizeThumb);
}

function loadDribbbleShots() {
  var container = document.getElementById("shots");
  if (!container) return;

  fetch("/data/dribbble-shots.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Failed to load shots");
      return response.json();
    })
    .then(function (shots) {
      if (!shots.length) {
        container.innerHTML = "<p>No shots yet!</p>";
        return;
      }

      container.innerHTML = shots
        .map(function (shot) {
          return (
            '<a class="shot" target="_blank" rel="noopener" href="' +
            shot.html_url +
            '"><img src="' +
            shot.image +
            '" alt="' +
            shot.title.replace(/"/g, "&quot;") +
            '"/></a>'
          );
        })
        .join("");
    })
    .catch(function () {
      container.innerHTML =
        '<p>Could not load gallery. <a href="https://dribbble.com/joneckert" target="_blank" rel="noopener">View shots on Dribbble</a>.</p>';
    });
}

function getProjectSlugFromHref(href) {
  if (!href) return null;
  var match = href.match(/\/projects\/([^/]+)/);
  return match ? match[1] : null;
}

function isProjectGateUnlocked(slug) {
  try {
    return sessionStorage.getItem("project-gate-unlock-" + slug) === "1";
  } catch (e) {
    return false;
  }
}

function initProjectGateBadges() {
  var cards = document.querySelectorAll(".card-link");
  if (!cards.length) return;

  fetch("/data/project-gates.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Failed to load project gates");
      return response.json();
    })
    .then(function (gates) {
      cards.forEach(function (card) {
        var slug = getProjectSlugFromHref(card.getAttribute("href"));
        if (!slug || !gates[slug]) return;

        var thumb = card.querySelector(".card-thumb");
        if (!thumb || thumb.querySelector(".card-gate-lock")) return;

        var unlocked = isProjectGateUnlocked(slug);
        var lock = document.createElement("span");
        lock.className = "card-gate-lock" + (unlocked ? " card-gate-lock--unlocked" : "");
        lock.setAttribute("aria-hidden", "true");
        lock.innerHTML =
          '<i class="fal ' + (unlocked ? "fa-lock-open" : "fa-lock") + '"></i>';
        thumb.appendChild(lock);
      });
    })
    .catch(function () {});
}

document.addEventListener("DOMContentLoaded", function () {
  initNavMenu();
  initThemeToggle();
  initGallerySizeControls();
  initProjectGateBadges();
  loadDribbbleShots();
});
