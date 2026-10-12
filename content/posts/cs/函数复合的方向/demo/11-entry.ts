import { run } from "./11-push-add.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "函数加法的前推",
  autoOpen: true,
  inputs: {
    n: {
      label: "输入",
      type: "number",
      default: 1,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
