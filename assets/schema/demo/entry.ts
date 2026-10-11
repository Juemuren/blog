import type { Demo, InputField } from "../../ts/demo/types";

type InputKindForValue<T> = {
  [Kind in InputField["type"]]: Extract<
    T,
    NonNullable<Extract<InputField, { type: Kind }>["default"]>
  > extends never
    ? never
    : Kind;
}[InputField["type"]];

type InputFieldFor<Name extends string, TValue> = Extract<
  InputField,
  { type: InputKindForValue<TValue> }
> & { name: Name };

type InputFieldForValues<TValues> = {
  [Name in keyof TValues & string]: InputFieldFor<Name, TValues[Name]>;
}[keyof TValues & string];

export interface DemoEntry<TRun extends (values: never) => string>
  extends Omit<Demo, "inputs" | "run"> {
  inputs: InputFieldForValues<Parameters<TRun>[0]>[];
  run: TRun;
}
