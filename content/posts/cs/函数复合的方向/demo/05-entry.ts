import { run } from "./05-binop.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "前推和拉回作为二元运算",
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
