import assert from "node:assert/strict";
import { convertMathDelimiters } from "./convert-math-delimiters.ts";

Deno.test("replaces inline math delimiters without changing nearby text", () => {
  const source = String.raw`
中文 \(x_i + y\) 文本
`;
  const expected = String.raw`
中文 $x_i + y$ 文本
`
  assert.equal(
    convertMathDelimiters(source),
    expected,
  );
});

Deno.test("replaces display delimiters without changing line layout", () => {
  const source = String.raw`
中文

\[
x + y
\]

文本
`
  const expected = String.raw`
中文

$$
x + y
$$

文本
`
  assert.equal(
    convertMathDelimiters(source),
    expected
  );
});

Deno.test("does not change already converted math", () => {
  const source = `
$x$

$$
x + y
$$
  `;
  assert.equal(
    convertMathDelimiters(source),
    source
  );
});
