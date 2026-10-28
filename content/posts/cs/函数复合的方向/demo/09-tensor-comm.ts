import { tensor, tensorPullback, tensorPushforward } from "./utils.ts";

const T = tensor(2, (x: number, y: number) => x*x + y*y);
const f = (x: number) => x + 1;
const g = (x: string) => x.length;

// 先拉回再前推
const lhs = tensorPushforward(f)(
  tensorPullback(g)(T)
);
// 先前推再拉回
const rhs = tensorPullback(g)(
  tensorPushforward(f)(T)
);

interface Param {
  s1: string,
  s2: string
}

export function run({ s1, s2 }: Param) {
  return [
    `lhs: ${lhs.apply(s1, s2)}`,
    `rhs: ${rhs.apply(s1, s2)}`,
  ].join("\n");
}
