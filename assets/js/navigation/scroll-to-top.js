(() => {
  var toplink = document.getElementById("top-link");
  window.onscroll = () => {
    const scrollThreshold = window.innerHeight;
    if (
      document.body.scrollTop > scrollThreshold ||
      document.documentElement.scrollTop > scrollThreshold
    ) {
      toplink.classList.remove("hidden");
    } else {
      toplink.classList.add("hidden");
    }
  };
})();
