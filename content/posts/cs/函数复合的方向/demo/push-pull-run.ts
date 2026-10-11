import { pushforward, pullback } from "./utils.ts";

// number => boolean
const f = (x: number) => x > 4;

// (string => number) -> (string => boolean)
const pushed = pushforward(f)(
  (s: string) => s.length
);

// (boolean => string) -> (number => string)
const pulled = pullback(f)(
  x => `value=${x}`
);

interface Param {
  s: string
  n: number
}

export function run({ s, n }: Param) {
  return [
    String(pushed(s)),
    pulled(n),
  ].join("\n");
}
