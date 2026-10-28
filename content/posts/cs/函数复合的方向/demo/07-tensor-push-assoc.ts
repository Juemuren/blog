import { tensor, tensorPushforward, pushforward } from "./utils.ts";

const T = tensor(2, (x: number, y: number) => x*x + y*y);
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
    `pushLeft: ${pushLeft.apply(n1, n2)}`,
    `pushRight: ${pushRight.apply(n1, n2)}`,
  ].join("\n");
}
