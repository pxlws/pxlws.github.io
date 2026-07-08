function myFunction() {
  var x = document.getElementById("hamburger-dropdown");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
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

document.addEventListener("DOMContentLoaded", loadDribbbleShots);
