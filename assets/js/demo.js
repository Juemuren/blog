// Each demo declares numeric inputs and returns plain text from run(values).
export function mount(container, demo) {
  container.classList.add("interactive-demo");
  const form = document.createElement("form");
  form.className = "interactive-demo-controls";
  const fields = demo.inputs.map((field) => {
    if (field.type !== "number") {
      throw new Error(`Unsupported demo input type: ${field.type}`);
    }
    const label = document.createElement("label");
    label.textContent = field.label;
    const input = document.createElement("input");
    input.type = field.type;
    input.name = field.name;
    input.value = field.default;
    input.required = true;
    for (const attribute of ["min", "max", "step"]) {
      if (field[attribute] !== undefined) input[attribute] = field[attribute];
    }
    input.inputMode = field.step === 1 ? "numeric" : "decimal";
    label.append(input);
    form.append(label);
    return input;
  });

  const button = document.createElement("button");
  button.type = "submit";
  button.textContent = demo.action ?? "运行";
  form.append(button);
  const description = document.createElement("p");
  description.className = "interactive-demo-hint";
  description.textContent = demo.description ?? "";
  description.hidden = !demo.description;
  const pre = document.createElement("pre");
  pre.className = "interactive-demo-output";
  pre.tabIndex = 0;
  pre.setAttribute("aria-label", "运行结果");
  const output = document.createElement("code");
  pre.append(output);
  const status = document.createElement("p");
  status.className = "interactive-demo-status";
  status.setAttribute("role", "status");
  container.replaceChildren(form, description, pre, status);

  async function run() {
    if (button.disabled || !form.reportValidity()) return;
    const values = Object.fromEntries(
      fields.map((input) => [input.name, input.valueAsNumber]),
    );
    button.disabled = true;
    status.textContent = "正在运行…";
    try {
      output.textContent = await demo.run(values);
      status.textContent = "运行完成。";
    } catch (error) {
      output.textContent = "";
      status.textContent = "运行失败，请检查输入后重试。";
      console.error(error);
    } finally {
      button.disabled = false;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void run();
  });
  if (demo.autorun) void run();
}
