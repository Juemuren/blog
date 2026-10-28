import { run } from "./15-tensor-push-pull-plus-times.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "张量和与张量积的拉回和前推",
  autoOpen: true,
  inputs: {
    n1: {
      label: "T的输入1",
      type: "number",
      default: 1,
    },
    n2: {
      label: "T的输入2",
      type: "number",
      default: 2,
    },
    n3: {
      label: "S的输入",
      type: "number",
      default: 3,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
