(() => {
  function applyThemeColors() {
    const primary = "var(--primary)"
    const secondary = "var(--secondary)"
    const theme = "var(--theme)"

    const options = window.JXG.Options;
    Object.assign(options.text, {
      strokeColor: primary,
      highlightStrokeColor: primary,
    });
    Object.assign(options.label, {
      strokeColor: primary,
      highlightStrokeColor: primary,
    });
    Object.assign(options.ticks, {
      strokeColor: secondary,
      highlightStrokeColor: primary,
    });
    Object.assign(options.slider, {
      strokeColor: primary,
      highlightStrokeColor: primary,
      fillColor: theme,
      highlightFillColor: theme,
    });
    Object.assign(options.slider.baseline, {
      strokeColor: secondary,
      highlightStrokeColor: primary,
    });
    Object.assign(options.slider.ticks, {
      strokeColor: secondary,
      highlightStrokeColor: primary,
    });
    Object.assign(options.slider.highline, {
      strokeColor: primary,
      highlightStrokeColor: primary,
    });
    Object.assign(options.slider.label, {
      strokeColor: primary,
      highlightStrokeColor: primary,
    });
  }

  function renderDiagram(source, index) {
    const container = document.createElement("div");
    container.id = `jsxgraph-diagram-${index + 1}`;
    container.className = "jsxgraph-container";
    source.replaceWith(container);

    const code = source.textContent.trim()
    const render = Function("JXG", "BOARDID", code);
    render(JXG, container.id);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyThemeColors();
    document.querySelectorAll("pre.jsxgraph").forEach(renderDiagram);
  });
})();
