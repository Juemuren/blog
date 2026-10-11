import { pushforward, pullback } from "./utils.ts";

// number => boolean
const f = (x: number) => x > 2;

// (string => number) -> (string => boolean)
const pushed = pushforward(f)(
  (s: string) => s.length
);

// (boolean => string) -> (number => string)
const pulled = pullback(f)(
  x => `value=${x}`
);

export function run({}) {
  console.log(pushed("hello")); // true
  console.log(pulled(5)); // "value=true"
}

