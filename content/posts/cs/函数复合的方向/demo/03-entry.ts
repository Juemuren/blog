import { run } from "./03-pull-assoc.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "拉回的结合律",
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
