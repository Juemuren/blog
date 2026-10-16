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
})();
