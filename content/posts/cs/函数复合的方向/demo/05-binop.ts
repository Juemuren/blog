import { pullBin, pushBin } from "./utils.ts";

const f = (x: number) => x + 1;
const g = (x: number) => x * 2;
const h = (x: number) => `Result: ${x}`;

// 前推左结合
const pushLeft = pushBin(pushBin(h, g), f);
//前推右结合
const pushRight = pushBin(h, pushBin(g, f));

// 拉回左结合
const pullLeft = pullBin(pullBin(f, g), h);
// 拉回右结合
const pullRight = pullBin(f, pullBin(g, h));

interface Param {
  x: number
}

export function run({ x }: Param) {
  return [
    `pushLeft: ${pushLeft(x)}`,
    `pushRight: ${pushRight(x)}`,
    `pullLeft: ${pullLeft(x)}`,
    `pullRight: ${pullRight(x)}`,
  ].join("\n")
}
