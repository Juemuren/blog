import { run } from "./01-push-pull.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "前推和拉回",
  autoOpen: true,
  inputs: {
    s: {
      label: "前推输入",
      type: "string",
      default: "hello",
    },
    n: {
      label: "拉回输入",
      type: "number",
      default: 5,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
