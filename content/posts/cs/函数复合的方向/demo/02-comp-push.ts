import { pushforward, compose } from "./utils.ts";

const h = (x: number) => x + 1;
const g = (x: number) => x * 2;
const f = (x: number) => `Result: ${x}`;

// 复合映射诱导的前推
const comp = pushforward(
  compose(f, g)
)(h)
// 前推左结合
const lhs = pushforward(
  pushforward(f)(g)
)(h);
// 前推右结合
const rhs = pushforward(f)(
  pushforward(g)(h)
);

interface Param {
  x: number
}

export function run({ x }: Param) {
  return [
    `comp: ${comp(x)}`,
    `lhs: ${lhs(x)}`,
    `rhs: ${rhs(x)}`,
  ].join("\n")
}
