import assert from "node:assert/strict";
import { convertMathDelimiters } from "./convert-math-delimiters.ts";

Deno.test("converts paired delimiters without changing layout", () => {
  const source = [
    String.raw`中文 \(x_i + y\) 文本`,
    "",
    String.raw`\[`,
    String.raw`\begin{pmatrix}a & b\end{pmatrix}`,
    String.raw`\]`,
    "",
  ].join("\r\n");
  const expected = [
    "中文 $x_i + y$ 文本",
    "",
    "$$",
    String.raw`\begin{pmatrix}a & b\end{pmatrix}`,
    "$$",
    "",
  ].join("\r\n");
  assert.equal(convertMathDelimiters(source), expected);
  assert.equal(convertMathDelimiters(expected), expected);
});

Deno.test("preserves delimiters in frontmatter", () => {
  const source = [
    "---",
    String.raw`summary: "\(front matter\)"`,
    "---",
  ].join("\n");
  assert.equal(convertMathDelimiters(source), source);
});

Deno.test("preserves delimiters in inline code", () => {
  const source = "`\\(inline code\\)`";
  assert.equal(convertMathDelimiters(source), source);
});

Deno.test("preserves delimiters in fenced code", () => {
  const source = [
    "```text",
    String.raw`\[fenced code\]`,
    "```",
  ].join("\n");
  assert.equal(convertMathDelimiters(source), source);
});

Deno.test("preserves delimiters in existing dollar math", () => {
  const source = String.raw`$\(existing math\)$`;
  assert.equal(convertMathDelimiters(source), source);
});

Deno.test("preserves delimiters in HTML comments", () => {
  const source = String.raw`<!-- \(html comment\) -->`;
  assert.equal(convertMathDelimiters(source), source);
});

Deno.test("skips unmatched, nested, and escaped delimiters", () => {
  const source = String
    .raw`\(unmatched \\(literal\\) \(nested \(inner\) outer\) \[wrong\) \(valid\)`;
  assert.equal(
    convertMathDelimiters(source),
    source.replace(String.raw`\(valid\)`, "$valid$"),
  );
});

Deno.test("converts only odd-length runs of backslashes", () => {
  const source = [
    String.raw`\(one\)`,
    String.raw`\\(two\\)`,
    String.raw`\\\(three\\\)`,
    String.raw`\\\\(four\\\\)`,
  ].join(" ");
  const expected = [
    "$one$",
    String.raw`\\(two\\)`,
    String.raw`\\$three\\$`,
    String.raw`\\\\(four\\\\)`,
  ].join(" ");
  assert.equal(convertMathDelimiters(source), expected);
});

Deno.test("converts display math inside blockquotes and lists", () => {
  const source = [
    "> quote",
    ">",
    String.raw`> \[`,
    "> E = mc^2",
    String.raw`> \]`,
    "",
    "- item",
    String.raw`  \[`,
    "  x + y",
    String.raw`  \]`,
  ].join("\n");
  const expected = source.replaceAll(String.raw`\[`, () => "$$")
    .replaceAll(String.raw`\]`, () => "$$");
  assert.equal(convertMathDelimiters(source), expected);
});

Deno.test("keeps block and inline math in Markdown containers distinct", () => {
  const source = [
    String.raw`*before \(x * y\) after*`,
    String.raw`\[same line\]`,
    "",
    "```md",
    String.raw`\[`,
    "code",
    String.raw`\]`,
    "```",
  ].join("\n");
  const expected = source.replace(String.raw`\(x * y\)`, "$x * y$")
    .replace(String.raw`\[same line\]`, () => "$$same line$$");
  assert.equal(convertMathDelimiters(source), expected);
});

Deno.test("does not convert an unclosed display math opener", () => {
  const source = [String.raw`\[`, "x + y", String.raw`\(later\)`].join("\n");
  assert.equal(
    convertMathDelimiters(source),
    source.replace(String.raw`\(later\)`, "$later$"),
  );
});

Deno.test("converts inline math across a soft line break", () => {
  const source = [String.raw`before \(a +`, String.raw`b\) after`].join("\n");
  assert.equal(convertMathDelimiters(source), "before $a +\nb$ after");
});

Deno.test("preserves trailing spaces on display delimiter lines", () => {
  const source = [String.raw`\[  `, "x + y", String.raw`\]   `].join("\n");
  assert.equal(
    convertMathDelimiters(source),
    ["$$  ", "x + y", "$$   "].join("\n"),
  );
});
