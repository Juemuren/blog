import assert from "node:assert/strict";
import { visit } from "unist-util-visit";
import {
  parseMathMarkdown,
  type TextInlineMathNode,
  type TextMathNode,
} from "./parse-math-markdown.ts";

function mathNodes(source: string): Array<TextInlineMathNode | TextMathNode> {
  const nodes: Array<TextInlineMathNode | TextMathNode> = [];
  visit(parseMathMarkdown(source), (node) => {
    if (node.type === "textInlineMath" || node.type === "textMath") {
      nodes.push(node);
    }
  });
  return nodes;
}

Deno.test("parses inline math as one node inside emphasis", () => {
  const source = String.raw`
*before \(x * y\) after*
`;
  const math = [] as Array<{
    value: string;
    start?: number;
    end?: number;
    delimiters?: TextInlineMathNode["delimiters"];
  }>;
  visit(parseMathMarkdown(source), "textInlineMath", (node) => {
    math.push({
      value: node.value,
      start: node.position?.start.offset,
      end: node.position?.end.offset,
      delimiters: node.delimiters,
    });
  });
  assert.deepEqual(math, [{
    value: "x * y",
    start: 9,
    end: 18,
    delimiters: {
      opening: { start: 9, end: 11 },
      closing: { start: 16, end: 18 },
    },
  }]);
});

Deno.test("parses display math after blockquote prefixes", () => {
  const source = String.raw`
> \[
> E = mc^2
> \]
`;
  const quote = parseMathMarkdown(source).children[0];
  if (quote.type !== "blockquote") assert.fail("expected blockquote");
  const math = quote.children[0];
  if (math.type !== "textMath") assert.fail("expected textMath");
  assert.equal(math.value, "E = mc^2");
  assert.equal(
    source.slice(math.position?.start.offset, math.position?.end.offset),
    String.raw`\[
> E = mc^2
> \]`,
  );
  assert.deepEqual(math.delimiters, {
    opening: { start: 3, end: 5 },
    closing: { start: 19, end: 21 },
  });
});

Deno.test("does not parse math delimiters in frontmatter", () => {
  const source = String.raw`
---
summary: "\(front matter\)"
---
`.trimStart();
  assert.deepEqual(mathNodes(source), []);
});

Deno.test("does not parse math delimiters in inline code", () => {
  assert.deepEqual(mathNodes("`\\(inline code\\)`"), []);
});

Deno.test("does not parse math delimiters in fenced code", () => {
  const source = String.raw`
~~~text
\[fenced code\]
~~~
`;
  assert.deepEqual(mathNodes(source), []);
});

Deno.test("does not parse math delimiters inside existing dollar math", () => {
  assert.deepEqual(mathNodes(String.raw`$\(existing math\)$`), []);
});

Deno.test("does not parse math delimiters in HTML comments", () => {
  assert.deepEqual(mathNodes(String.raw`<!-- \(html comment\) -->`), []);
});

Deno.test("does not parse an unmatched inline opener", () => {
  assert.deepEqual(mathNodes(String.raw`\(unmatched`), []);
});

Deno.test("uses Markdown backslash escaping for openers", () => {
  assert.deepEqual(mathNodes(String.raw`\\(escaped\\)`), []);
  const source = String.raw`\\\(math\\\)`;
  const nodes = mathNodes(source);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, "textInlineMath");
  assert.equal(nodes[0].position?.start.offset, 2);
});

Deno.test("parses display math after list prefixes", () => {
  const source = String.raw`
- item
  \[
  x + y
  \]
`;
  const list = parseMathMarkdown(source).children[0];
  if (list.type !== "list") assert.fail("expected list");
  const math = list.children[0].children.find((node) =>
    node.type === "textMath"
  );
  if (math?.type !== "textMath") assert.fail("expected textMath in list item");
  assert.equal(math.value, "x + y");
});

Deno.test("does not parse an unclosed display block", () => {
  const source = String.raw`
\[
x + y
\(later\)
`;
  const nodes = mathNodes(source);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, "textInlineMath");
  assert.equal(nodes[0].value, "later");
});

Deno.test("parses inline math across a soft line break", () => {
  const source = String.raw`
before \(a +
b\) after
`;
  const nodes = mathNodes(source);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, "textInlineMath");
  assert.equal(nodes[0].value, "a +\nb");
});

Deno.test("keeps display delimiter line spaces outside the math value", () => {
  const source = "\\[  \nx + y\n\\]   \n";
  const nodes = mathNodes(source);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, "textMath");
  assert.equal(nodes[0].value, "x + y");
  assert.deepEqual(nodes[0].delimiters, {
    opening: { start: 0, end: 2 },
    closing: { start: 11, end: 13 },
  });
  assert.equal(source.slice(nodes[0].position?.end.offset), "\n");
});
