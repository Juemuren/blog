import { add, pushforward } from "./utils";

const f = (x: number) => x * x;
const u = (x: number) => x;
const v = (x: number) => 1;

// 先相加后前推
const lhs = pushforward(f)(
  add(u, v)
);

// 先前推后相加
const rhs = add(
  pushforward(f)(u),
  pushforward(f)(v)
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
