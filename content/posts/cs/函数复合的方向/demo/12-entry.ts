import { run } from "./12-pull-mul.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "函数乘法的拉回",
  autoOpen: true,
  inputs: {
    n: {
      label: "输入",
      type: "number",
      default: 3,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
