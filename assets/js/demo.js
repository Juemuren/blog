// Each demo declares numeric inputs and synchronously returns text from run(values).
export function mount(container, demo, messages) {
  const form = container.querySelector("form");
  const button = container.querySelector("button");
  const description = container.querySelector(".interactive-demo-hint");
  const output = container.querySelector("code");
  const status = container.querySelector('[role="status"]');
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

  function run() {
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(
      fields.map((input) => [input.name, input.valueAsNumber]),
    );
    try {
      output.textContent = demo.run(values);
      status.textContent = messages.completed;
    } catch (error) {
      output.textContent = "";
      status.textContent = messages.runFailed;
      console.error(error);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });
  container.querySelector("[data-demo-content]").hidden = false;
  status.textContent = "";
  if (demo.autorun) run();
}
