import { pushforward, pullback } from "./utils.ts";

const g = (x: number) => x + 1;
const h = (x: number) => x * 2;
const f = (x: number) => `Result: ${x}`;

// 先前推再拉回
const lhs = pullback(g)(pushforward(f)(h));
// 先拉回再前推
const rhs = pushforward(f)(pullback(g)(h));

interface Param {
  x: number
}

export function run({ x }: Param) {
  return [
    `lhs: ${lhs(x)}`,
    `rhs: ${rhs(x)}`,
  ].join("\n")
}
