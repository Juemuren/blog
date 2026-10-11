import type { Demo, InputFieldOptions } from "../../ts/demo/types";

// Each run parameter must have exactly one compatible input field.
type InputFieldForValues<TValues> = {
  [Name in keyof TValues & string]-?: Extract<
    InputFieldOptions,
    { default?: TValues[Name] }
  >;
};

export interface DemoEntry<TRun extends (values: never) => string>
  extends Omit<Demo, "inputs" | "run"> {
  inputs: InputFieldForValues<Parameters<TRun>[0]>;
  run: TRun;
}
