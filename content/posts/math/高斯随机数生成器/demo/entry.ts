import { run } from "./gaussian.ts";

import type { DemoEntry } from "@demo/entry";

export default {
  autoRun: true,
  title: "高斯随机数生成器",
  inputs: {
    seed: {
      label: "种子",
      type: "number",
      default: 114514,
      min: 0,
      max: 4294967295,
      step: 1,
    },
    count: {
      label: "生成数量",
      type: "number",
      default: 5,
      min: 1,
      max: 1000,
      step: 1,
    },
  },
  run,
} satisfies DemoEntry<typeof run>;
