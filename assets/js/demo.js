// Build the form and parameter reference once, without running the example.
export function createDemo(container, demo) {
  const form = container.querySelector("form");
  const runButton = form.querySelector('button[type="submit"]');
  const title = container.querySelector(".interactive-demo-title");
  const inputTemplate = container.querySelector("[data-demo-input]");
  const parameterTemplate = container.querySelector("[data-demo-parameter]");
  const parameterTableBody = container.querySelector("[data-demo-parameters]");

  title.textContent = demo.title ?? "";
  title.hidden = !demo.title;

  const inputs = [];
  for (const field of demo.inputs) {
    const { element, input } = createInput(inputTemplate, field);
    const parameterRow = createParameterRow(parameterTemplate, field);

    form.insertBefore(element, runButton);
    parameterTableBody.append(parameterRow);
    inputs.push(input);
  }

  inputTemplate.remove();
  parameterTemplate.remove();

  function readValues() {
    return Object.fromEntries(
      inputs.map((input) => [input.name, input.valueAsNumber]),
    );
  }

  return {
    form,
    output: container.querySelector(".interactive-demo-output code"),
    readValues,
  };
}

// Bind execution only after the form has been initialized.
export function bindRunner(view, demo, messages) {
  const { form, output, readValues } = view;

  function runDemo() {
    if (!form.reportValidity()) return;

    try {
      const values = readValues();
      output.textContent = demo.run(values);
    } catch (error) {
      output.textContent = messages.runFailed;
      console.error(error);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runDemo();
  });

  if (demo.autorun) runDemo();
}

function createInput(template, field) {
  if (field.type !== "number") {
    throw new Error(`Unsupported demo input type: ${field.type}`);
  }

  const element = template.content.firstElementChild.cloneNode(true);
  const input = element.querySelector("input");
  element.querySelector("[data-field-label]").textContent = field.label;

  input.name = field.name;
  input.value = field.default;
  input.inputMode = field.step === 1 ? "numeric" : "decimal";

  for (const attribute of ["min", "max", "step"]) {
    if (field[attribute] !== undefined) {
      input[attribute] = field[attribute];
    }
  }

  return { element, input };
}

function createParameterRow(template, field) {
  const row = template.content.firstElementChild.cloneNode(true);
  row.querySelector("[data-field-label]").textContent = field.label;
  row.querySelector("[data-field-name]").textContent = field.name;
  row.querySelector("[data-field-type]").textContent = field.type;

  for (const bound of ["min", "max"]) {
    // Preserve the translated "unbounded" text when no limit is configured.
    if (field[bound] !== undefined) {
      row.querySelector(`[data-field-${bound}]`).textContent = field[bound];
    }
  }

  return row;
}
