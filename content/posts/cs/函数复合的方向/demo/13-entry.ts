import { run } from "./13-push-mul.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "函数乘法的前推",
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
