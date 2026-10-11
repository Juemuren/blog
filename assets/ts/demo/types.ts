interface FieldOptions {
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
  };
}

export type InputKind = keyof FieldOptions;
export type InputValue = string | number;
export type InputValues = Record<string, InputValue>;

export type Fields = {
  [K in InputKind]: FieldOptions[K] & {
    type: K;
    name: string;
    label: string;
  };
};
export type InputField = Fields[InputKind];

export interface Demo {
  title?: string;
  autorun?: boolean;
  inputs: InputField[];
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
