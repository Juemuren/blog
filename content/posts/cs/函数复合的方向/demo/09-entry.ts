import { run } from "./09-tensor-comm.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "张量前推和张量拉回的交换律",
  autoOpen: true,
  inputs: {
    s1: {
      label: "输入1",
      type: "string",
      default: "he",
    },
    s2: {
      label: "输入2",
      type: "string",
      default: "llo",
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
