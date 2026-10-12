import { mul, pushforward } from "./utils";

const f = (x: number) => x + 1;
const u = (x: number) => x;
const v = (x: number) => 1;

// 先相乘后前推
const lhs = pushforward(f)(
  mul(u, v)
);

// 先前推后拉回
const rhs = mul(
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
