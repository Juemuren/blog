// Each type owns its control setup, value conversion, and displayed bounds.
// Add new types here without changing the form assembly or runner.
const inputTypes = {
  number: {
    configure(input, field) {
      input.type = "number";
      input.value = field.default ?? "";
      input.required = true;
      input.inputMode = field.step === 1 ? "numeric" : "decimal";
      input.step = field.step ?? "any";
      for (const bound of ["min", "max"]) {
        if (field[bound] !== undefined) input[bound] = field[bound];
      }
    },
    readValue(input) {
      return input.valueAsNumber;
    },
    getBounds(field) {
      // Undefined keeps the template's translated "unbounded" label.
      return { min: field.min, max: field.max };
    },
  },
  string: {
    configure(input, field) {
      input.type = "text";
      input.value = field.default ?? "";
      input.required = true;
      for (const bound of ["minLength", "maxLength"]) {
        if (field[bound] !== undefined) input[bound] = field[bound];
      }
    },
    readValue(input) {
      return input.value;
    },
    getBounds(field) {
      return { min: field.minLength, max: field.maxLength };
    },
  },
};

export function getInputType(type) {
  if (!Object.hasOwn(inputTypes, type)) {
    throw new Error(`Unsupported demo input type: ${type}`);
  }
  return inputTypes[type];
}
