import { run } from "./gaussian.js";

export default {
  autorun: true,
  title: "高斯随机数生成器",
  inputs: [
    {
      name: "seed",
      label: "种子",
      type: "number",
      default: 114514,
      min: 0,
      max: 4294967295,
      step: 1,
    },
    {
      name: "count",
      label: "生成数量",
      type: "number",
      default: 5,
      min: 1,
      max: 1000,
      step: 1,
    },
  ],

  run,
};
