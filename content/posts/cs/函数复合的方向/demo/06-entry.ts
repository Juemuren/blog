import { run } from "./06-tensor.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  title: "张量前推和张量拉回",
  autoOpen: true,
  inputs: {
    n1: {
      label: "前推输入1",
      type: "number",
      default: 3,
    },
    n2: {
      label: "前推输入2",
      type: "number",
      default: 4,
    },
    b1: {
      label: "拉回输入1",
      type: "boolean",
      default: false,
    },
    b2: {
      label: "拉回输入2",
      type: "boolean",
      default: true,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
