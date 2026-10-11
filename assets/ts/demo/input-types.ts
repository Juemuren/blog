import type { InputKind, InputType } from "./types.ts";

function setBound(
  input: HTMLInputElement,
  attribute: "min" | "max" | "minlength" | "maxlength",
  value: number | undefined,
): number | undefined {
  if (value === undefined) return;
  if (typeof value !== "number") {
    throw new Error(`Demo constraint ${attribute} must be a number`);
  }
  input.setAttribute(attribute, String(value));
  return value;
}

// Add input handlers here without changing the form assembly or runner.
const inputTypes: { [K in InputKind]: InputType<K> } = {
  number: {
    configure(input, field) {
      input.type = "number";
      input.value = String(field.default ?? "");
      input.required = true;
      input.inputMode = field.step === 1 ? "numeric" : "decimal";
      input.step = String(field.step ?? "any");
      return {
        min: setBound(input, "min", field.min),
        max: setBound(input, "max", field.max),
      };
    },
    readValue(input) {
      return input.valueAsNumber;
    },
  },
  string: {
    configure(input, field) {
      input.type = "text";
      input.value = field.default ?? "";
      input.required = true;
      return {
        min: setBound(input, "minlength", field.minLength),
        max: setBound(input, "maxlength", field.maxLength),
      };
    },
    readValue(input) {
      return input.value;
    },
  },
};

export function getInputType<K extends InputKind>(type: K): InputType<K> {
  if (!Object.hasOwn(inputTypes, type)) {
    throw new Error(`Unsupported demo input type: ${type}`);
  }
  return inputTypes[type];
}
