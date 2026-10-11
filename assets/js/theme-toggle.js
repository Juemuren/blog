(() => {
  document.getElementById("theme-toggle").addEventListener("click", () => {
      const html = document.querySelector("html");
      if (html.dataset.theme === "dark") {
          html.dataset.theme = 'light';
          localStorage.setItem("pref-theme", 'light');
      } else {
          html.dataset.theme = 'dark';
          localStorage.setItem("pref-theme", 'dark');
      }
  })
})();
