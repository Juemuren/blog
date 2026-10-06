(() => {
  function renderDiagram(source, index) {
    const container = document.createElement("div");
    container.id = `abc-diagram-${index + 1}`;
    container.className = "abc-container";
    source.replaceWith(container);

    const code = source.textContent.trim();
    ABCJS.renderAbc(container.id, code, {
      responsive: "resize",
      selectTypes: false,
      oneSvgPerLine: true,
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("pre.abc").forEach(renderDiagram);
  });
})();
