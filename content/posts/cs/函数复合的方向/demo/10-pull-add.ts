import { add, pullback } from "./utils";

const f = (x: number) => x + 1;
const g = (x: number) => x * x;
const h = (x: number) => x * 2;

// 先相加后拉回
const lhs = pullback(h)(
  add(f, g)
);

// 先拉回后相加
const rhs = add(
  pullback(h)(f),
  pullback(h)(g)
);

interface Param {
  n: number,
}

export function run({ n }: Param) {
  return [
    `lhs: ${lhs(n)}`,
    `rhs: ${rhs(n)}`,
  ].join("\n");
}
