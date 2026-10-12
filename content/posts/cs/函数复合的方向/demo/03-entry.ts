import { run } from "./03-comp-pull.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "复合函数的拉回",
  autoOpen: true,
  inputs: {
    x: {
      label: "输入",
      type: "number",
      default: 5,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
