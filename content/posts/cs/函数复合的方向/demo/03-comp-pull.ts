import { pullback, compose } from "./utils.ts";

const f = (x: number) => x + 1;
const g = (x: number) => x * 2;
const h = (x: number) => `Result: ${x}`;

// 复合映射诱导的拉回
const comp = pullback(
  compose(g, f)
)(h)
// 拉回左结合
const lhs = pullback(
  pullback(f)(g)
)(h);
// 拉回右结合
const rhs = pullback(f)(
  pullback(g)(h)
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
