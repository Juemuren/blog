import { bindRunner, createDemo } from "./runtime.js";

async function initDemo(container) {
  const loading = container.querySelector("[data-demo-loading]");
  const { entry, loadFailed, runFailed } = container.dataset;
  let demo, view;

  try {
    const definition = await import(entry);
    demo = definition.default;
    view = createDemo(container, demo);
  } catch (error) {
    loading.textContent = loadFailed;
    console.error(error);
    return;
  }

  loading.remove();
  container.querySelector("[data-demo-content]").hidden = false;
  bindRunner(view, demo, { runFailed });
}

// Module scripts run after parsing, so every demo container is available here.
for (const container of document.querySelectorAll(
  ".interactive-demo[data-entry]",
)) {
  initDemo(container);
}
