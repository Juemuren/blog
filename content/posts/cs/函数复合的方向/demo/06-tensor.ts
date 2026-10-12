import { tensorPushforward, tensorPullback } from "./utils.ts";

const T = (x: number, y: number) => x*x + y*y;
// number^2 => number

// number^2 => string
const pushed = tensorPushforward(
  (x: number) => `value=${x}`
)(T);

// boolean^2 => number
const pulled = tensorPullback(
  (x: boolean) => x ? 2 : 3
)(T);

interface Param {
  n1: number,
  n2: number
  b1: boolean,
  b2: boolean,
}

export function run({ n1, n2, b1, b2 }: Param) {
  return [
    `pushed: ${String(pushed(n1, n2))}`,
    `pulled: ${pulled(b1, b2)}`,
  ].join("\n");
}
