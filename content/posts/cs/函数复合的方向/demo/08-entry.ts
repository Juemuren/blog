import { run } from "./08-tensor-pull-assoc.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "张量拉回的结合性",
  autoOpen: true,
  inputs: {
    b1: {
      label: "输入1",
      type: "boolean",
      default: true,
    },
    b2: {
      label: "输入2",
      type: "boolean",
      default: false,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
