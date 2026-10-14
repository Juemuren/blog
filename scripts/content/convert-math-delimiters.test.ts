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

Deno.test("skips Markdown structures that must retain delimiters", () => {
  const source = [
    "---",
    String.raw`summary: "\(front matter\)"`,
    "---",
    "",
    String.raw`\(change\) and $\(existing math\)$ and ` + "`\\(inline code\\)`",
    "",
    "```text",
    String.raw`\[fenced code\]`,
    "```",
    "",
    String.raw`[link](https://example.com/\(path\))`,
    "",
    String.raw`<!-- \(html comment\) -->`,
    "",
  ].join("\n");
  assert.equal(
    convertMathDelimiters(source),
    source.replace(String.raw`\(change\)`, "$change$"),
  );
});

Deno.test("skips unmatched, nested, and escaped delimiters", () => {
  const source = String
    .raw`\(unmatched \\(literal\\) \(nested \(inner\) outer\) \[wrong\) \(valid\)`;
  assert.equal(
    convertMathDelimiters(source),
    source.replace(String.raw`\(valid\)`, "$valid$"),
  );
});
