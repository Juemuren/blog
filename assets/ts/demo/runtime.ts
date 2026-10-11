import { cloneTemplate, requireElement } from "./dom.ts";
import { getInputType } from "./input.ts";
import type {
  Bounds,
  Demo,
  DemoView,
  InputField,
  InputType,
  InputValue,
  RunMessages,
} from "./types.ts";

// Build the form and parameter reference once, without running the example.
export function createDemo(container: HTMLElement, demo: Demo): DemoView {
  const title = requireElement(container, ".interactive-demo-title");
  title.textContent = demo.title ?? "";
  title.hidden = !demo.title;

  const details = requireElement<HTMLDetailsElement>(
    container,
    ".interactive-demo-details",
  );
  details.open = demo.autoOpen ?? false;

  const form = requireElement<HTMLFormElement>(
    container,
    ".interactive-demo-controls",
  );
  const inputTemplate = requireElement<HTMLTemplateElement>(
    container,
    "[data-demo-input]",
  );
  const parameterTemplate = requireElement<HTMLTemplateElement>(
    container,
    "[data-demo-parameter]",
  );

  const readers = new Map<string, () => InputValue>();
  for (const [name, options] of Object.entries(demo.inputs)) {
    const field: InputField = { ...options, name };
    const type = getInputType(field.type);
    const { element, readValue, bounds } = createInput(
      inputTemplate,
      field,
      type,
    );
    const parameterRow = createParameterRow(parameterTemplate, field, bounds);

    requireElement(form, ".interactive-demo-fields").append(element);
    requireElement(container, "[data-demo-parameters]").append(parameterRow);
    readers.set(name, readValue);
  }

  inputTemplate.remove();
  parameterTemplate.remove();

  return {
    form,
    output: requireElement(container, ".interactive-demo-output code"),
    readValues: () =>
      Object.fromEntries(
        Array.from(readers, ([name, readValue]) => [name, readValue()]),
      ),
  };
}

// Bind execution only after the form has been initialized.
export function bindRunner(view: DemoView, demo: Demo, messages: RunMessages) {
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

  if (demo.autoRun) runDemo();
}

function createInput(
  template: HTMLTemplateElement,
  field: InputField,
  type: InputType,
) {
  const element = cloneTemplate(template);
  requireElement(element, "[data-field-label]").textContent = field.label;

  const input = requireElement<HTMLInputElement>(element, "input");
  input.name = field.name;
  const bounds = type.configure(input, field);

  return {
    element,
    readValue: () => type.readValue(input),
    bounds,
  };
}

function createParameterRow(
  template: HTMLTemplateElement,
  field: InputField,
  bounds: Bounds,
) {
  const row = cloneTemplate(template);
  requireElement(row, "[data-field-label]").textContent = field.label;
  requireElement(row, "[data-field-name]").textContent = field.name;
  requireElement(row, "[data-field-type]").textContent = field.type;

  for (const [bound, value] of Object.entries(bounds)) {
    // Preserve the translated "unbounded" text when no limit is configured.
    if (value !== undefined) {
      requireElement(row, `[data-field-${bound}]`).textContent = String(value);
    }
  }

  return row;
}
