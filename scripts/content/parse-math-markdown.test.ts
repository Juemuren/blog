import assert from "node:assert/strict";
import { visit } from "unist-util-visit";
import { parseMathMarkdown } from "./parse-math-markdown.ts";

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

Deno.test("leaves code, existing math, and escaped openers outside custom nodes", () => {
  const source = [
    String.raw`\\(escaped\\) $\(existing\)$`,
    "```md",
    String.raw`\[code\]`,
    "```",
  ].join("\n");
  const types: string[] = [];
  visit(parseMathMarkdown(source), (node) => {
    if (node.type === "textInlineMath" || node.type === "textMath") {
      types.push(node.type);
    }
  });
  assert.deepEqual(types, []);
});
