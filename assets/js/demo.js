// Build the configured form once; do not execute the demonstrated code here.
export function createDemo(container, demo) {
  const form = container.querySelector("form");
  const button = container.querySelector("button");
  const description = container.querySelector(".interactive-demo-hint");
  const inputTemplate = container.querySelector("[data-demo-input]");

  if (demo.action != null) button.textContent = demo.action;
  description.textContent = demo.description ?? "";
  description.hidden = !demo.description;

  const fields = demo.inputs.map((field) => {
    if (field.type !== "number") {
      throw new Error(`Unsupported demo input type: ${field.type}`);
    }
    const label = inputTemplate.content.firstElementChild.cloneNode(true);
    label.querySelector("span").textContent = field.label;
    const input = label.querySelector("input");
    Object.assign(input, {
      name: field.name,
      value: field.default,
      inputMode: field.step === 1 ? "numeric" : "decimal",
    });
    for (const key of ["min", "max", "step"]) {
      if (field[key] !== undefined) input[key] = field[key];
    }
    form.insertBefore(label, button);
    return input;
  });
  inputTemplate.remove();

  return {
    form,
    output: container.querySelector("code"),
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
