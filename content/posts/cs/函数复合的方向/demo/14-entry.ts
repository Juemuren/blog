import { run } from "./14-tensor-plus-times.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "张量和与张量积",
  autoOpen: true,
  inputs: {
    n1: {
      label: "T的输入1",
      type: "number",
      default: 3,
    },
    n2: {
      label: "T的输入2",
      type: "number",
      default: 4,
    },
    s: {
      label: "S的输入",
      type: "string",
      default: "hello",
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
