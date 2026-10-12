import { run } from "./07-tensor-push-assoc.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "张量前推的结合性",
  autoOpen: true,
  inputs: {
    n1: {
      label: "输入1",
      type: "number",
      default: 2,
    },
    n2: {
      label: "输入2",
      type: "number",
      default: 3,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
