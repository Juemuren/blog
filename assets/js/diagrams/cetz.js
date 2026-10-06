import { $typst } from 'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst.ts@0.7.0/dist/esm/contrib/all-in-one-lite.bundle.js';

$typst.setCompilerInitOptions({
  getModule: () => 'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0/pkg/typst_ts_web_compiler_bg.wasm',
});
$typst.setRendererInitOptions({
  getModule: () => 'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@0.7.0/pkg/typst_ts_renderer_bg.wasm',
});

async function renderDiagram(source) {
  const code = `
#import "@preview/cetz:0.5.2"
#set page(width: auto, height: auto, margin: 0pt, fill: none)
#cetz.canvas({
import cetz.draw: *
${source.textContent.trim()}
})
`;
  const svg = await $typst.svg({ mainContent: code });

  const container = document.createElement('div');
  container.className = 'cetz-container';
  container.innerHTML = svg;
  source.replaceWith(container);
}

document.querySelectorAll('pre.cetz').forEach(renderDiagram)
