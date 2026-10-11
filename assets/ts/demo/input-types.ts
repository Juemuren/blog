// Bounds map parameter-table columns to field options and DOM properties.
// Add new types here without changing the form assembly or runner.
const inputTypes = {
  number: {
    bounds: { min: "min", max: "max" },
    configure(input, field) {
      input.type = "number";
      input.value = field.default ?? "";
      input.required = true;
      input.inputMode = field.step === 1 ? "numeric" : "decimal";
      input.step = field.step ?? "any";
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

export function getInputType(type) {
  if (!Object.hasOwn(inputTypes, type)) {
    throw new Error(`Unsupported demo input type: ${type}`);
  }
  const definition = inputTypes[type];
  return {
    configure(input, field) {
      definition.configure(input, field);
      for (const property of Object.values(definition.bounds)) {
        if (field[property] !== undefined) input[property] = field[property];
      }
    },
    readValue: definition.readValue,
    getBounds(field) {
      // Undefined keeps the template's translated "unbounded" label.
      return Object.fromEntries(
        Object.entries(definition.bounds).map(([bound, property]) => [
          bound,
          field[property],
        ]),
      );
    },
  };
}
