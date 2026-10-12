import { tensorPullback } from "./utils.ts";

const T = (x: number, y: number) => x*x + y*y;
const h = (x: string) => Number(x);
const k = (x: boolean) => x ? "2" : "3";

// 张量拉回左结合
const pullLeft = tensorPullback(
  (x: boolean) => h(k(x))
)(T);

// 张量拉回右结合
const pullRight = tensorPullback(k)(
  tensorPullback(h)(T)
);

interface Param {
  b1: boolean,
  b2: boolean
}

export function run({ b1, b2 }: Param) {
  return [
    `pullLeft: ${pullLeft(b1, b2)}`,
    `pullRight: ${pullRight(b1, b2)}`,
  ].join("\n");
}
