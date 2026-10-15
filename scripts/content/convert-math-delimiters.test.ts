import assert from "node:assert/strict";
import { convertMathDelimiters } from "./convert-math-delimiters.ts";

Deno.test("replaces inline math delimiters without changing nearby text", () => {
  const source = String.raw`
中文 \(x_i + y\) 文本
`;
  const expected = String.raw`
中文 $x_i + y$ 文本
`;
  assert.equal(
    convertMathDelimiters(source),
    expected,
  );
});

Deno.test("replaces display math delimiters without changing line layout", () => {
  const source = String.raw`
中文

\[
x + y
\]

文本
`;
  const expected = String.raw`
中文

$$
x + y
$$

文本
`;
  assert.equal(
    convertMathDelimiters(source),
    expected,
  );
});

Deno.test("replaces display math delimiters inside a blockquote", () => {
  const source = String.raw`
> \[
> E = mc^2
> \]
`;
  const expected = `
> $$
> E = mc^2
> $$
`;
  assert.equal(convertMathDelimiters(source), expected);
});

Deno.test("replaces display math delimiters inside a list item", () => {
  const source = String.raw`
- item
    \[
    x + y
    \]
`;
  const expected = `
- item
    $$
    x + y
    $$
`;
  assert.equal(convertMathDelimiters(source), expected);
});


Deno.test("leaves frontmatter untouched while converting body math", () => {
  const source = String.raw`
---
summary: "\(front matter\)"
---

正文 \(x\)
`.trimStart();
  const expected = String.raw`
---
summary: "\(front matter\)"
---

正文 $x$
`.trimStart();
  assert.equal(convertMathDelimiters(source), expected);
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
    source,
  );
});
