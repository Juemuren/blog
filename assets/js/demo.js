// Build the configured form once; do not execute the demonstrated code here.
export function createDemo(container, demo) {
  const form = container.querySelector("form");
  const button = container.querySelector("button");
  const title = container.querySelector(".interactive-demo-title");
  const inputTemplate = container.querySelector("[data-demo-input]");
  const parameterTemplate = container.querySelector("[data-demo-parameter]");
  const parameters = container.querySelector("[data-demo-parameters]");

  title.textContent = demo.title ?? "";
  title.hidden = !demo.title;

  const fields = demo.inputs.map((field) => {
    if (field.type !== "number") {
      throw new Error(`Unsupported demo input type: ${field.type}`);
    }
    const element = inputTemplate.content.firstElementChild.cloneNode(true);
    element.querySelector("[data-field-label]").textContent = field.label;
    const row = parameterTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector("[data-field-label]").textContent = field.label;
    row.querySelector("[data-field-name]").textContent = field.name;
    row.querySelector("[data-field-type]").textContent = field.type;
    for (const key of ["min", "max"]) {
      if (field[key] !== undefined) {
        row.querySelector(`[data-field-${key}]`).textContent = field[key];
      }
    }
    parameters.append(row);
    const input = element.querySelector("input");
    Object.assign(input, {
      name: field.name,
      value: field.default,
      inputMode: field.step === 1 ? "numeric" : "decimal",
    });
    for (const key of ["min", "max", "step"]) {
      if (field[key] !== undefined) input[key] = field[key];
    }
    form.insertBefore(element, button);
    return input;
  });
  inputTemplate.remove();
  parameterTemplate.remove();

  return {
    form,
    output: container.querySelector(".interactive-demo-output code"),
    readValues: () => Object.fromEntries(
      fields.map((input) => [input.name, input.valueAsNumber]),
    ),
  };
}

// Run the demonstrated code on submission; initialization is already complete.
export function bindRunner(view, demo, messages) {
  function run() {
    if (!view.form.reportValidity()) return;
    try {
      view.output.textContent = demo.run(view.readValues());
    } catch (error) {
      view.output.textContent = messages.runFailed;
      console.error(error);
    }
  }

  view.form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });
  if (demo.autorun) run();
}
