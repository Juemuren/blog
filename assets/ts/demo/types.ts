// Add an entry here.
interface FieldsByKind {
  number: {
    type: "number";
    label: string;
    default: number;
    min?: number;
    max?: number;
    step?: number | "any";
  };
  string: {
    type: "string";
    label: string;
    default: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  boolean: {
    type: "boolean";
    label: string;
    default: boolean;
  };
}
export type InputKind = keyof FieldsByKind;
export type InputField = FieldsByKind[InputKind];
export type InputValue = NonNullable<InputField["default"]>;
export type InputValues = Record<string, InputValue>;

export interface Bounds {
  min?: number | string;
  max?: number | string;
}

export interface InputType<K extends InputKind = InputKind> {
  configure(input: HTMLInputElement, field: FieldsByKind[K]): Bounds;
  readValue(input: HTMLInputElement): InputValue;
}

export interface Demo {
  title?: string;
  autoRun?: boolean;
  autoOpen?: boolean;
  inputs: Record<string, InputField>;
  run(values: InputValues): string;
}

export interface DemoView {
  form: HTMLFormElement;
  output: HTMLElement;
  readValues(): InputValues;
}

export interface RunMessages {
  runFailed: string;
}
