// Add an entry here.
interface BaseFieldOptionsByKind {
  number: {
    default?: number;
    min?: number;
    max?: number;
    step?: number | "any";
  };
  string: {
    default?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  boolean: {
    default?: boolean;
  };
}
export type InputKind = keyof BaseFieldOptionsByKind;

interface FieldMetadata<K extends InputKind> {
  type: K;
  name: string;
  label: string;
}

type FieldsByKind = {
  [K in InputKind]: BaseFieldOptionsByKind[K] & FieldMetadata<K>;
};
export type InputField = FieldsByKind[InputKind];
export type InputFieldOptions = {
  [K in InputKind]: Omit<FieldsByKind[K], "name">;
}[InputKind];
export type InputValue = NonNullable<
  BaseFieldOptionsByKind[InputKind]["default"]
>;
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
  inputs: Record<string, InputFieldOptions>;
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
