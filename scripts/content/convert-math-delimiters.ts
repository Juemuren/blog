import { visit } from "unist-util-visit";
import { parseMathMarkdown } from "./parse-math-markdown.ts";

type DelimiterEdit = { start: number; end: number; replacement: string };

export function convertMathDelimiters(source: string): string {
  const edits: DelimiterEdit[] = [];
  visit(parseMathMarkdown(source), (node) => {
    if (node.type !== "textInlineMath" && node.type !== "textMath") return;

    if (!node.delimiters) return;
    const replacement = node.type === "textMath" ? "$$" : "$";
    edits.push(
      { ...node.delimiters.opening, replacement },
      { ...node.delimiters.closing, replacement },
    );
  });

  let output = "";
  let cursor = 0;
  for (const edit of edits.sort((a, b) => a.start - b.start)) {
    output += source.slice(cursor, edit.start) + edit.replacement;
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
