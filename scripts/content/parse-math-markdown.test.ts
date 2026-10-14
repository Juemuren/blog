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
  const source = String.raw`*before \(x * y\) after*`;
  const math = [] as Array<
    { value: string; delimiter: string; start?: number; end?: number }
  >;
  visit(parseMathMarkdown(source), "textInlineMath", (node) => {
    math.push({
      value: node.value,
      delimiter: node.delimiter,
      start: node.position?.start.offset,
      end: node.position?.end.offset,
    });
  });
  assert.deepEqual(math, [{
    value: "x * y",
    delimiter: "(",
    start: 8,
    end: 17,
  }]);
  assert.equal(source.slice(math[0].start, math[0].end), String.raw`\(x * y\)`);
});

Deno.test("parses display math after blockquote prefixes", () => {
  const source = [String.raw`> \[`, "> E = mc^2", String.raw`> \]`].join("\n");
  const quote = parseMathMarkdown(source).children[0];
  assert.equal(quote.type, "blockquote");
  if (quote.type !== "blockquote") throw new Error("expected blockquote");
  const math = quote.children[0];
  assert.equal(math.type, "textMath");
  if (math.type !== "textMath") throw new Error("expected textMath");
  assert.equal(math.value, "E = mc^2");
  assert.equal(
    source.slice(math.position?.start.offset, math.position?.end.offset),
    String.raw`\[` + "\n> E = mc^2\n> " + String.raw`\]`,
  );
});

Deno.test("distinguishes same-line brackets from a display block", () => {
  const source = [
    String.raw`\[same line\]`,
    "",
    String.raw`\[`,
    "x + y",
    String.raw`\]`,
  ]
    .join("\n");
  const types: string[] = [];
  visit(parseMathMarkdown(source), (node) => {
    if (node.type === "textInlineMath" || node.type === "textMath") {
      types.push(node.type);
    }
  });
  assert.deepEqual(types, ["textInlineMath", "textMath"]);
});

Deno.test("does not parse math delimiters in frontmatter", () => {
  const source = ["---", String.raw`summary: "\(front matter\)"`, "---"]
    .join("\n");
  assert.deepEqual(mathNodes(source), []);
});

Deno.test("does not parse math delimiters in inline code", () => {
  assert.deepEqual(mathNodes("`\\(inline code\\)`"), []);
});

Deno.test("does not parse math delimiters in fenced code", () => {
  const source = ["```text", String.raw`\[fenced code\]`, "```"].join("\n");
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

Deno.test("does not parse nested inline openers", () => {
  assert.deepEqual(mathNodes(String.raw`\(nested \(inner\) outer\)`), []);
});

Deno.test("does not parse mismatched inline delimiters", () => {
  assert.deepEqual(mathNodes(String.raw`\[wrong\)`), []);
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
  const source = ["- item", String.raw`  \[`, "  x + y", String.raw`  \]`]
    .join("\n");
  const nodes = mathNodes(source);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, "textMath");
  assert.equal(nodes[0].value, "x + y");
});

Deno.test("does not parse an unclosed display block", () => {
  const source = [String.raw`\[`, "x + y", String.raw`\(later\)`].join("\n");
  const nodes = mathNodes(source);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, "textInlineMath");
  assert.equal(nodes[0].value, "later");
});

Deno.test("parses inline math across a soft line break", () => {
  const source = [String.raw`before \(a +`, String.raw`b\) after`].join("\n");
  const nodes = mathNodes(source);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, "textInlineMath");
  assert.equal(nodes[0].value, "a +\nb");
});

Deno.test("keeps display delimiter line spaces outside the math value", () => {
  const source = [String.raw`\[  `, "x + y", String.raw`\]   `].join("\n");
  const nodes = mathNodes(source);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].type, "textMath");
  assert.equal(nodes[0].value, "x + y");
  assert.equal(nodes[0].position?.end.offset, source.length);
});
