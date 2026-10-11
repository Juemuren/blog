import { run } from "./02-comp-push.ts";

export default {
  title: "复合函数的前推",
  autoOpen: true,
  inputs: [
    {
      name: "x",
      label: "输入",
      type: "number",
      default: 5,
    },
  ],
  run,
};
