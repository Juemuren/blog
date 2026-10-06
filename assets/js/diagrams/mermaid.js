import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

function getTheme() {
  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'neutral';
}

function createDiagram(source, index) {
  const container = document.createElement('div');
  container.className = 'mermaid-container';
  source.replaceWith(container);

  return {
    id: `mermaid-diagram-${index + 1}`,
    code: source.textContent.trim(),
    container,
  };
}

async function renderDiagram({ id, code, container }) {
  const { svg, bindFunctions } = await mermaid.render(id, code, container);
  container.innerHTML = svg;
  bindFunctions?.(container);
}

async function renderDiagrams(diagrams) {
  mermaid.initialize({ theme: getTheme(), startOnLoad: false });
  await Promise.all(diagrams.map(renderDiagram));
}

function observeThemeChanges(onThemeChange) {
  const observer = new MutationObserver(() => {
    onThemeChange();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

function init() {
  const diagrams = Array.from(
    document.querySelectorAll('pre.mermaid'),
    createDiagram
  );

  observeThemeChanges(() => renderDiagrams(diagrams));
  renderDiagrams(diagrams);
}

init();
