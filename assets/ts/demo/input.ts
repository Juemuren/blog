import { setAttributes } from "./dom.ts";
import type { InputKind, InputType } from "./types.ts";

// Add input handlers here without changing the form assembly or runner.
const inputTypes: { [K in InputKind]: InputType<K> } = {
  number: {
    configure(input, field) {
      setAttributes(input, {
        type: "number",
        value: field.default,
        inputmode: field.step === 1 ? "numeric" : "decimal",
        step: field.step ?? "any",
        min: field.min,
        max: field.max,
      });
      return {
        min: field.min,
        max: field.max,
        step: field.step,
      };
    },
    readValue(input) {
      return input.valueAsNumber;
    },
  },
  string: {
    configure(input, field) {
      setAttributes(input, {
        type: "text",
        value: field.default,
        pattern: field.pattern,
        minlength: field.minLength,
        maxlength: field.maxLength,
      });
      return {
        pattern: field.pattern,
        minlength: field.minLength,
        maxlength: field.maxLength,
      };
    },
    readValue(input) {
      return input.value;
    },
  },
  boolean: {
    configure(input, field) {
      setAttributes(input, {
        type: "text",
        value: field.default,
        pattern: "true|false",
      });
      return {
        oneOf: [true, false],
      };
    },
    readValue(input) {
      return input.value === "true";
    },
  },
};

export function getInputType<K extends InputKind>(type: K): InputType<K> {
  if (!Object.hasOwn(inputTypes, type)) {
    throw new Error(`Unsupported demo input type: ${type}`);
  }
  return inputTypes[type];
}
