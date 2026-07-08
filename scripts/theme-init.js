(function () {
  try {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("theme-dark");
    }
  } catch (e) {}
})();
