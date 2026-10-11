export const boundProperties = {
  number: { min: "min", max: "max" },
  string: { min: "minLength", max: "maxLength" },
} as const;

export type BoundProperty = typeof boundProperties;
export type BoundValue = number;

interface FieldOptionsBase {
  number: {
    default?: number;
    step?: number | "any";
  };
  string: {
    default?: string;
  };
}

type BoundFields<T> = {
  [K in keyof T as T[K] & PropertyKey]?: BoundValue;
};

type FieldOptions = {
  [K in keyof BoundProperty]: K extends keyof FieldOptionsBase
    ? FieldOptionsBase[K] & BoundFields<BoundProperty[K]>
    : never;
};

export type InputKind = keyof FieldOptionsBase;
export type InputValue = NonNullable<FieldOptions[InputKind]["default"]>;
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
