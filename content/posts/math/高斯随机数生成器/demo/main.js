import { createGaussianRandomGenerator } from "./gaussian.js";

export default {
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
  action: "生成",
  autorun: true,
  description: "每次从指定种子重新生成，最多 1000 个；相同种子和数量会得到相同结果。",

  run({ seed, count }) {
    const next = createGaussianRandomGenerator(seed);
    return Array.from({ length: count }, () => next()).join("\n");
  },
};
