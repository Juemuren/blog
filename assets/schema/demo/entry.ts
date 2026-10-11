import type { Demo, InputField, InputValue } from "../../ts/demo/types";

export interface DemoEntry<TRun extends (value: never) => string>
  extends Omit<Demo, "inputs" | "run"> {
  inputs: {
    [Name in keyof Parameters<TRun>[0] & string]-?: Extract<
      InputField,
      { default?: Parameters<TRun>[0][Name] }
    >;
  };
  run: Parameters<TRun> extends [Record<keyof Parameters<TRun>[0], InputValue>]
    ? TRun
    : never;
}
