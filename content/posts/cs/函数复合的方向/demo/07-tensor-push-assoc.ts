import { tensorPushforward, pushforward } from "./utils.ts";

const T = (x: number, y: number) => x*x + y*y;
const f = (x: number) => x + 1;
const g = (x: number) => `value=${x}`;

// 张量前推左结合
const pushLeft = tensorPushforward(
  pushforward(g)(f)
)(T);

// 张量前推右结合
const pushRight = tensorPushforward(g)(
  tensorPushforward(f)(T)
);

interface Param {
  n1: number,
  n2: number
}

export function run({ n1, n2 }: Param) {
  return [
    `pushLeft: ${pushLeft(n1, n2)}`,
    `pullRight: ${pushRight(n1, n2)}`,
  ].join("\n");
}
