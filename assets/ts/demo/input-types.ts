import type {
  BoundValue,
  FieldsByKind,
  InputKind,
  InputType,
  InputTypeDefinition,
} from "./types.ts";
import { boundPropertyNames } from "./types.ts";

// Add input handlers here without changing the form assembly or runner.
const inputTypes: { [K in InputKind]: InputTypeDefinition<K> } = {
  number: {
    configure(input, field) {
      input.type = "number";
      input.value = String(field.default ?? "");
      input.required = true;
      input.inputMode = field.step === 1 ? "numeric" : "decimal";
      input.step = String(field.step ?? "any");
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
  const definition = inputTypes[type];
  const bounds = boundPropertyNames[type];

  function readBound(
    field: FieldsByKind[K],
    property: string,
  ): BoundValue | undefined {
    const value: unknown = (field as Record<string, unknown>)[property];
    if (value !== undefined && typeof value !== "number") {
      throw new Error(`Demo constraint ${property} must be a number`);
    }
    return value;
  }

  return {
    configure(input, field) {
      definition.configure(input, field);
      for (const property of Object.values(bounds)) {
        const value = readBound(field, property);
        if (value !== undefined) {
          input.setAttribute(property.toLowerCase(), String(value));
        }
      }
    },
    readValue: definition.readValue,
    getBounds(field) {
      // Undefined keeps the template's translated "unbounded" label.
      return Object.fromEntries(
        Object.entries(bounds).map(([bound, property]) => [
          bound,
          readBound(field, property),
        ]),
      ) as ReturnType<InputType<K>["getBounds"]>;
    },
  };
}
