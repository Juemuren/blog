import assert from "node:assert/strict";
import { visit } from "unist-util-visit";
import {
  parseMathMarkdown,
  type TextInlineMathNode,
  type TextMathNode,
} from "./parse-math-markdown.ts";

type MathNode = TextInlineMathNode | TextMathNode;
type MathSnapshot = {
  type: MathNode["type"];
  value: string;
  start?: number;
  end?: number;
  delimiters?: MathNode["delimiters"];
};

function mathSnapshots(source: string): MathSnapshot[] {
  const nodes: MathSnapshot[] = [];
  visit(parseMathMarkdown(source), (node) => {
    if (node.type === "textInlineMath" || node.type === "textMath") {
      nodes.push({
        type: node.type,
        value: node.value,
        start: node.position?.start.offset,
        end: node.position?.end.offset,
        delimiters: node.delimiters,
      });
    }
  });
  return nodes;
}

Deno.test("parses inline math and records delimiter positions", () => {
  const before = "before ";
  const after = " after";
  const math = "x * y";
  const leftDelimiter = String.raw`\(`;
  const rightDelimiter = String.raw`\)`;
  const source = `${before}${leftDelimiter}${math}${rightDelimiter}${after}`;
  const start = before.length;
  const closingStart = start + leftDelimiter.length + math.length;
  const end = closingStart + rightDelimiter.length;

  assert.deepEqual(mathSnapshots(source), [{
    type: "textInlineMath",
    value: math,
    start,
    end,
    delimiters: {
      opening: { start, end: start + leftDelimiter.length },
      closing: { start: closingStart, end },
    },
  }]);
});

Deno.test("parses block math and records delimiter positions", () => {
  const before = "before\n\n";
  const after = "\n\nafter";
  const math = "E = mc^2";
  const leftDelimiter = String.raw`\[`;
  const rightDelimiter = String.raw`\]`;
  const body = `\n${math}\n`;
  const source = `${before}${leftDelimiter}${body}${rightDelimiter}${after}`;
  const start = before.length;
  const closingStart = start + leftDelimiter.length + body.length;
  const end = closingStart + rightDelimiter.length;

  assert.deepEqual(mathSnapshots(source), [{
    type: "textMath",
    value: math,
    start,
    end,
    delimiters: {
      opening: { start, end: start + leftDelimiter.length },
      closing: { start: closingStart, end },
    },
  }]);
});

Deno.test("does not parse unclosed math delimiters", () => {
  const sources = [
    String.raw`\(unclosed`,
    String.raw`
\[
unclosed
`,
  ];
  assert.deepEqual(
    sources.map(mathSnapshots),[
      [],
      []
    ]
  );
});
