import { run } from "./01-push-pull.ts";

export default {
  title: "前推和拉回",
  inputs: [
    {
      name: "s",
      label: "前推输入",
      type: "string",
      default: "hello",
    },
    {
      name: "n",
      label: "拉回输入",
      type: "number",
      default: 5,
    },
  ],
  run,
};
