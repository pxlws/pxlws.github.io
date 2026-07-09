(function () {
  var match = window.location.pathname.match(/\/projects\/([^/]+)/);
  var slug = match && match[1];
  if (!slug) return;

  var STORAGE_KEY = "project-gate-unlock-" + slug;

  function isUnlocked() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setUnlocked() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
  }

  function lockPage() {
    document.documentElement.classList.add("project-gate-locked");
    document.body.classList.add("project-gate-locked");
  }

  function unlockPage() {
    document.documentElement.classList.remove("project-gate-locked");
    document.body.classList.remove("project-gate-locked");
  }

  function toHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var hex = "";
    for (var i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex;
  }

  function hashPassword(password, salt) {
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.reject(new Error("Secure hashing is not available in this browser."));
    }

    return window.crypto.subtle
      .digest("SHA-256", new TextEncoder().encode((salt || "") + password))
      .then(toHex);
  }

  function normalizeGate(entry) {
    if (!entry) return null;

    if (typeof entry === "string") {
      return { hash: entry, salt: "" };
    }

    if (entry.hash) {
      return { hash: entry.hash, salt: entry.salt || "" };
    }

    return null;
  }

  function createGate(gate) {
    var expectedHash = gate.hash;
    var salt = gate.salt || "";

    var overlay = document.createElement("div");
    overlay.id = "project-gate";
    overlay.className = "project-gate";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "project-gate-title");

    overlay.innerHTML =
      '<div class="project-gate-panel">' +
      '<h2 id="project-gate-title">Password required</h2>' +
      "<p>This project is password protected.</p>" +
      '<form class="project-gate-form">' +
      '<label class="project-gate-label" for="project-gate-password">Password</label>' +
      '<input type="password" id="project-gate-password" class="project-gate-input" autocomplete="current-password" required>' +
      '<button type="submit" class="project-gate-submit ghost-button">Enter</button>' +
      '<p class="project-gate-error" id="project-gate-error" hidden>Incorrect password. Try again.</p>' +
      "</form>" +
      "</div>";

    var form = overlay.querySelector(".project-gate-form");
    var input = overlay.querySelector("#project-gate-password");
    var error = overlay.querySelector("#project-gate-error");
    var submit = overlay.querySelector(".project-gate-submit");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      error.hidden = true;
      submit.disabled = true;

      hashPassword(input.value, salt)
        .then(function (digest) {
          if (digest === expectedHash) {
            setUnlocked();
            unlockPage();
            overlay.remove();
            return;
          }

          error.hidden = false;
          input.value = "";
          input.focus();
        })
        .catch(function () {
          error.textContent = "Unable to verify password in this browser.";
          error.hidden = false;
        })
        .then(function () {
          submit.disabled = false;
        });
    });

    document.body.appendChild(overlay);
    input.focus();
  }

  function initGate(config) {
    var gate = normalizeGate(config && config[slug]);

    if (!gate) {
      return;
    }

    if (isUnlocked()) {
      unlockPage();
      return;
    }

    lockPage();
    createGate(gate);
  }

  fetch("/data/project-gates.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Failed to load project gates");
      return response.json();
    })
    .then(initGate)
    .catch(function () {});
})();
