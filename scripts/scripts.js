function myFunction() {
  var x = document.getElementById("hamburger-dropdown");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

var GALLERY_SIZE_KEY = "gallery-shot-size";

function setGallerySize(size) {
  var container = document.getElementById("shots");
  if (!container) return;

  container.classList.remove("shots-size-small", "shots-size-medium", "shots-size-large");
  container.classList.add("shots-size-" + size);

  var buttons = document.querySelectorAll(".gallery-size-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle("is-active", buttons[i].dataset.size === size);
  }

  try {
    localStorage.setItem(GALLERY_SIZE_KEY, size);
  } catch (e) {}
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

document.addEventListener("DOMContentLoaded", function () {
  initGallerySizeControls();
  loadDribbbleShots();
});
