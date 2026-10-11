import { run } from "./02-comp-push.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "复合函数的前推",
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
