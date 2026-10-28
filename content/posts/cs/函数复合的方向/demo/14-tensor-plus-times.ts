import { tensor, tensorPlus, tensorTimes } from "./utils.ts";

// (number, number) -> number
const T = tensor(2, (x: number, y: number) => x * x + y * y);
// string -> number
const S = tensor(1, (x: string) => x.length);

// (number, number, string) => number
const sum = tensorPlus(T, S);
const product = tensorTimes(T, S);

interface Param {
  n1: number;
  n2: number;
  s: string;
}

export function run({ n1, n2, s }: Param) {
  return [
    `T(x, y) = ${T.apply(n1, n2)}`,
    `S(s) = ${S.apply(s)}`,
    `sum.rank = ${sum.rank}, sum(x, y, s) = ${sum.apply(n1, n1, s)}`,
    `product.rank = ${product.rank}, product(x, y, s) = ${product.apply(n1, n2, s)}`,
  ].join("\n");
}
