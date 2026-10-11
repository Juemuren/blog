// Add an entry here.
interface BaseFieldOptionsByKind {
  number: {
    default?: number;
    step?: number | "any";
  };
  string: {
    default?: string;
  };
}
export type InputKind = keyof BaseFieldOptionsByKind;

// Map table bounds to field option and DOM attribute names.
export const boundPropertyNames = {
  number: { min: "min", max: "max" },
  string: { min: "minLength", max: "maxLength" },
} as const satisfies Record<InputKind, object>;

export type BoundValue = number;
export type BoundPropertyNamesByKind = typeof boundPropertyNames;

type BoundOptionsFrom<Names> = {
  [Bound in keyof Names as Names[Bound] & PropertyKey]?: BoundValue;
};

type FieldOptionsByKind = {
  [K in InputKind]: BaseFieldOptionsByKind[K] &
    BoundOptionsFrom<BoundPropertyNamesByKind[K]>;
};

interface FieldMetadata<K extends InputKind> {
  type: K;
  name: string;
  label: string;
}

export type FieldsByKind = {
  [K in InputKind]: FieldOptionsByKind[K] & FieldMetadata<K>;
};
export type InputField = FieldsByKind[InputKind];
export type InputValue = NonNullable<FieldOptionsByKind[InputKind]["default"]>;
export type InputValues = Record<string, InputValue>;

export interface InputTypeDefinition<K extends InputKind> {
  configure(input: HTMLInputElement, field: FieldsByKind[K]): void;
  readValue(input: HTMLInputElement): InputValue;
}

export interface InputType<K extends InputKind = InputKind>
  extends InputTypeDefinition<K> {
  getBounds(
    field: FieldsByKind[K],
  ): Record<keyof BoundPropertyNamesByKind[InputKind], BoundValue | undefined>;
}

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
