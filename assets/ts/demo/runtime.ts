import { cloneTemplate, requireElement } from "./dom.ts";
import { getInputType } from "./input.ts";
import type {
  Constraints,
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
  for (const [name, field] of Object.entries(demo.inputs)) {
    const type = getInputType(field.type);
    const { element, readValue, constraints } = createInput(
      inputTemplate,
      name,
      field,
      type,
    );
    const parameterRow = createParameterRow(
      parameterTemplate,
      name,
      field,
      constraints,
    );

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
  name: string,
  field: InputField,
  type: InputType,
) {
  const element = cloneTemplate(template);
  requireElement(element, "[data-field-label]").textContent = field.label;

  const input = requireElement<HTMLInputElement>(element, "input");
  input.name = name;
  const constraints = type.configure(input, field);

  return {
    element,
    readValue: () => type.readValue(input),
    constraints,
  };
}

function createParameterRow(
  template: HTMLTemplateElement,
  name: string,
  field: InputField,
  constraints: Constraints,
) {
  const row = cloneTemplate(template);
  requireElement(row, "[data-field-label]").textContent = field.label;
  requireElement(row, "[data-field-name]").textContent = name;
  requireElement(row, "[data-field-type]").textContent = field.type;
  requireElement(row, "[data-field-constraints]").textContent =
    JSON.stringify(constraints);

  return row;
}
