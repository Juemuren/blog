// Each demo declares numeric inputs and synchronously returns text from run(values).
export function mount(container, demo, messages) {
  container.classList.add("interactive-demo");
  container.innerHTML = `
    <form class="interactive-demo-controls">
      <button type="submit"></button>
    </form>
    <p class="interactive-demo-hint"></p>
    <pre class="interactive-demo-output" tabindex="0"><code></code></pre>
    <p class="interactive-demo-status" role="status"></p>
  `;
  const form = container.querySelector("form");
  const button = container.querySelector("button");
  const description = container.querySelector(".interactive-demo-hint");
  const output = container.querySelector("code");
  const status = container.querySelector('[role="status"]');

  button.textContent = demo.action ?? messages.run;
  description.textContent = demo.description ?? "";
  description.hidden = !demo.description;
  container.querySelector("pre").setAttribute("aria-label", messages.output);

  const fields = demo.inputs.map((field) => {
    if (field.type !== "number") {
      throw new Error(`Unsupported demo input type: ${field.type}`);
    }
    const label = document.createElement("label");
    label.textContent = field.label;
    const input = document.createElement("input");
    Object.assign(input, {
      type: field.type,
      name: field.name,
      value: field.default,
      required: true,
      inputMode: field.step === 1 ? "numeric" : "decimal",
    });
    for (const key of ["min", "max", "step"]) {
      if (field[key] !== undefined) input[key] = field[key];
    }
    label.append(input);
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
  if (demo.autorun) run();
}
