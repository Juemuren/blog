import { run } from "./02-push-assoc.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "前推的结合律",
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
