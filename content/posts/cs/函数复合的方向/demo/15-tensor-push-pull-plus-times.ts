import {
  tensor,
  tensorPlus,
  tensorTimes,
  tensorPullback,
  tensorPushforward,
} from "./utils.ts";

const T = tensor(2, (x: number, y: number) => x + y);
const S = tensor(1, (x: number) => x);
const f = (x: number) => 2 * x;
const g = (x: number) => x + 1;

const pullPlusLeft = tensorPullback(f)(tensorPlus(T, S));
const pullPlusRight = tensorPlus(tensorPullback(f)(T), tensorPullback(f)(S));
const pullTimesLeft = tensorPullback(f)(tensorTimes(T, S));
const pullTimesRight = tensorTimes(tensorPullback(f)(T), tensorPullback(f)(S));

const pushPlusLeft = tensorPushforward(g)(tensorPlus(T, S));
const pushPlusRight = tensorPlus(tensorPushforward(g)(T), tensorPushforward(g)(S));
const pushTimesLeft = tensorPushforward(g)(tensorTimes(T, S));
const pushTimesRight = tensorTimes(tensorPushforward(g)(T), tensorPushforward(g)(S));

interface Param {
  n1: number;
  n2: number;
  n3: number;
}

export function run({ n1, n2, n3 }: Param) {
  return [
    `pullPlusLeft: ${pullPlusLeft.apply(n1, n2, n3)}`,
    `pullPlusRight: ${pullPlusRight.apply(n1, n2, n3)}`,
    "",
    `pullTimesLeft: ${pullTimesLeft.apply(n1, n2, n3)}`,
    `pullTimesRight: ${pullTimesRight.apply(n1, n2, n3)}`,
    "",
    `pushPlusLeft: ${pushPlusLeft.apply(n1, n2, n3)}`,
    `pushPlusRight: ${pushPlusRight.apply(n1, n2, n3)}`,
    "",
    `pushTimesLeft: ${pushTimesLeft.apply(n1, n2, n3)}`,
    `pushTimesRight: ${pushTimesRight.apply(n1, n2, n3)}`,
  ].join("\n");
}
