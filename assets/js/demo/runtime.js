import { getInputType } from "./input-types.js";

// Build the form and parameter reference once, without running the example.
export function createDemo(container, demo) {
  const form = container.querySelector("form");
  const fields = form.querySelector(".interactive-demo-fields");
  const title = container.querySelector(".interactive-demo-title");
  const inputTemplate = container.querySelector("[data-demo-input]");
  const parameterTemplate = container.querySelector("[data-demo-parameter]");
  const parameterTableBody = container.querySelector("[data-demo-parameters]");

  title.textContent = demo.title ?? "";
  title.hidden = !demo.title;

  const inputs = [];
  for (const field of demo.inputs) {
    const type = getInputType(field.type);
    const { element, readValue } = createInput(inputTemplate, field, type);
    const parameterRow = createParameterRow(parameterTemplate, field, type);

    fields.append(element);
    parameterTableBody.append(parameterRow);
    inputs.push({ name: field.name, readValue });
  }

  inputTemplate.remove();
  parameterTemplate.remove();

  function readValues() {
    return Object.fromEntries(
      inputs.map(({ name, readValue }) => [name, readValue()]),
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

function createInput(template, field, type) {
  const element = template.content.firstElementChild.cloneNode(true);
  const input = element.querySelector("input");
  element.querySelector("[data-field-label]").textContent = field.label;

  input.name = field.name;
  type.configure(input, field);

  return { element, readValue: () => type.readValue(input) };
}

function createParameterRow(template, field, type) {
  const row = template.content.firstElementChild.cloneNode(true);
  row.querySelector("[data-field-label]").textContent = field.label;
  row.querySelector("[data-field-name]").textContent = field.name;
  row.querySelector("[data-field-type]").textContent = field.type;

  for (const [bound, value] of Object.entries(type.getBounds(field))) {
    // Preserve the translated "unbounded" text when no limit is configured.
    if (value !== undefined) {
      row.querySelector(`[data-field-${bound}]`).textContent = value;
    }
  }

  return row;
}
