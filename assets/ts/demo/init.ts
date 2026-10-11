import { requireElement } from "./dom.ts";
import { bindRunner, createDemo } from "./runtime.ts";
import type { Demo } from "./types.ts";

async function initDemo(container: HTMLElement) {
  const { entry, loadFailed, runFailed } = container.dataset;
  if (!entry || !loadFailed || !runFailed) {
    throw new Error("Missing demo entry or messages");
  }

  const loading = requireElement(container, "[data-demo-loading]");
  try {
    const definition: { default: Demo } = await import(entry);
    const demo = definition.default;
    const view = createDemo(container, demo);

    loading.remove();
    requireElement(container, "[data-demo-content]").hidden = false;
    bindRunner(view, demo, { runFailed });
  } catch (error) {
    loading.textContent = loadFailed;
    console.error(error);
    return;
  }
}

// Module scripts run after parsing, so every demo container is available here.
for (const container of document.querySelectorAll<HTMLElement>(
  ".interactive-demo[data-entry]",
)) {
  initDemo(container);
}
