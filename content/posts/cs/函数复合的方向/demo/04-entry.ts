import { run } from "./04-comm.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "前推和拉回的交换律",
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
