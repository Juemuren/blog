export interface BoundProperty {
  number: { min: "min"; max: "max" };
  string: { min: "minLength"; max: "maxLength" };
}

interface FieldOptionsBase {
  number: {
    default?: number;
    step?: number | "any";
  };
  string: {
    default?: string;
  };
}

type FieldOptions = {
  [K in keyof BoundProperty]: K extends keyof FieldOptionsBase
    ? FieldOptionsBase[K] & Partial<Record<BoundProperty[K]["min" | "max"], number>>
    : never;
};

export type InputKind = keyof FieldOptions;
export type InputValue = NonNullable<
  FieldOptions[InputKind]["default"]
>;
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
