import type { Fields, InputKind, InputValue } from "./types.ts";

type Bound = "min" | "max";
type BoundProperty<K extends InputKind> = Extract<
  keyof Fields[K],
  "min" | "max" | "minLength" | "maxLength"
>;

interface InputTypeDefinition<K extends InputKind> {
  bounds: Record<Bound, BoundProperty<K>>;
  configure(input: HTMLInputElement, field: Fields[K]): void;
  readValue(input: HTMLInputElement): InputValue;
}

export interface InputType<K extends InputKind = InputKind> {
  configure(input: HTMLInputElement, field: Fields[K]): void;
  readValue(input: HTMLInputElement): InputValue;
  getBounds(field: Fields[K]): Record<Bound, number | undefined>;
}

// Bounds map parameter-table columns to field options and DOM properties.
// Add new types here without changing the form assembly or runner.
const inputTypes: { [K in InputKind]: InputTypeDefinition<K> } = {
  number: {
    bounds: { min: "min", max: "max" },
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
    bounds: { min: "minLength", max: "maxLength" },
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

  function readBound(field: Fields[K], bound: Bound): number | undefined {
    const property = definition.bounds[bound];
    const value: unknown = field[property];
    if (value !== undefined && typeof value !== "number") {
      throw new Error(`Demo constraint ${property} must be a number`);
    }
    return value;
  }

  return {
    configure(input, field) {
      definition.configure(input, field);
      for (const bound of ["min", "max"] as const) {
        const property = definition.bounds[bound];
        const value = readBound(field, bound);
        if (value !== undefined) {
          input.setAttribute(property.toLowerCase(), String(value));
        }
      }
    },
    readValue: definition.readValue,
    getBounds(field) {
      // Undefined keeps the template's translated "unbounded" label.
      return {
        min: readBound(field, "min"),
        max: readBound(field, "max"),
      };
    },
  };
}
