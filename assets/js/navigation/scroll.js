(() => {
  const menu = document.getElementById("menu");
  if (menu) {
    const scrollPosition = localStorage.getItem("menu-scroll-position");
    if (scrollPosition) {
      menu.scrollLeft = parseInt(scrollPosition, 10);
    }

    menu.onscroll = () => {
      localStorage.setItem("menu-scroll-position", menu.scrollLeft);
    };
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      var id = this.getAttribute("href").substr(1);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document
          .querySelector(`[id='${decodeURIComponent(id)}']`)
          .scrollIntoView({
            behavior: "smooth",
          });
      } else {
        document
          .querySelector(`[id='${decodeURIComponent(id)}']`)
          .scrollIntoView();
      }
      if (id === "top") {
        history.replaceState(null, null, " ");
      } else {
        history.pushState(null, null, `#${id}`);
      }
    });
  });
})();
