(() => {
  function renderDiagram(source) {
    const script = document.createElement('script');
    script.type = 'text/tikz';
    const code = source.textContent.trim();
    script.textContent = code;

    const container = document.createElement('div');
    container.className = 'tikz-container';
    container.appendChild(script);
    source.replaceWith(container);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('pre.tikz').forEach(renderDiagram);
  })
})();
