import type { Demo, InputField } from "../../ts/demo/types";

// Match each run parameter with fields whose values it can accept.
type InputFieldForValues<TValues> = {
  [Name in keyof TValues & string]: Extract<
    InputField,
    { default?: TValues[Name] }
  > & { name: Name };
}[keyof TValues & string];

export interface DemoEntry<TRun extends (values: never) => string>
  extends Omit<Demo, "inputs" | "run"> {
  inputs: InputFieldForValues<Parameters<TRun>[0]>[];
  run: TRun;
}
