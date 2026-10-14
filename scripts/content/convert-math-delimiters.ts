import { visit } from "unist-util-visit";
import { parseMathMarkdown } from "./parse-math-markdown.ts";

type Edit = { start: number; end: number; text: string };

export function convertMathDelimiters(source: string): string {
  const edits: Edit[] = [];
  visit(parseMathMarkdown(source), (node) => {
    if (node.type !== "textInlineMath" && node.type !== "textMath") return;

    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start === undefined || end === undefined) return;
    const delimiter = node.type === "textMath" || node.delimiter === "["
      ? "$$"
      : "$";
    edits.push({ start, end: start + 2, text: delimiter });
    const closeStart = node.type === "textMath"
      ? source.lastIndexOf(String.raw`\]`, end)
      : end - 2;
    edits.push({ start: closeStart, end: closeStart + 2, text: delimiter });
  });

  let output = "";
  let cursor = 0;
  for (const edit of edits.sort((a, b) => a.start - b.start)) {
    output += source.slice(cursor, edit.start) + edit.text;
    cursor = edit.end;
  }
  return output + source.slice(cursor);
}

if (import.meta.main) {
  if (Deno.args.length === 0) {
    console.error("Usage: deno task convert-math-delimiters FILE [FILE ...]");
    Deno.exit(2);
  }
  for (const path of Deno.args) {
    const original = Deno.readTextFileSync(path);
    const converted = convertMathDelimiters(original);
    if (converted !== original) Deno.writeTextFileSync(path, converted);
  }
}
