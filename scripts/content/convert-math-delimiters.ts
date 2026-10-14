import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";

type Range = { start: number; end: number };
type Edit = Range & { text: string };
type Opening = { start: number; close: ")" | "]"; valid: boolean };

const markdown = unified().use(remarkParse).use(remarkFrontmatter).use(
  remarkMath,
);
const protectedTypes = new Set([
  "code",
  "inlineCode",
  "math",
  "inlineMath",
  "html",
  "yaml",
  "toml",
  "link",
  "linkReference",
  "image",
  "imageReference",
  "definition",
]);

function protectedRanges(source: string): Range[] {
  const ranges: Range[] = [];

  visit(markdown.parse(source), (node) => {
    if (!protectedTypes.has(node.type)) return;

    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start !== undefined && end !== undefined) ranges.push({ start, end });
    return SKIP;
  });

  return ranges.sort((a, b) => a.start - b.start);
}

function scan(source: string, range: Range, edits: Edit[]): void {
  let opening: Opening | undefined;

  for (let i = range.start; i + 1 < range.end; i++) {
    if (source[i] !== "\\") continue;

    let preceding = 0;
    while (
      i - preceding - 1 >= range.start && source[i - preceding - 1] === "\\"
    ) {
      preceding++;
    }
    if (preceding % 2 !== 0) continue;

    const mark = source[i + 1];
    if (mark === "(" || mark === "[") {
      // Nested openings are ambiguous, so leave both pairs unchanged.
      opening = { start: i, close: mark === "(" ? ")" : "]", valid: !opening };
    } else if (mark === ")" || mark === "]") {
      if (opening?.close === mark && opening.valid) {
        const text = mark === ")" ? "$" : "$$";
        edits.push({ start: opening.start, end: opening.start + 2, text });
        edits.push({ start: i, end: i + 2, text });
      }
      opening = undefined;
    }
  }
}

export function convertMathDelimiters(source: string): string {
  const edits: Edit[] = [];
  let cursor = 0;

  for (const range of protectedRanges(source)) {
    if (cursor < range.start) {
      scan(source, { start: cursor, end: range.start }, edits);
    }
    cursor = Math.max(cursor, range.end);
  }
  if (cursor < source.length) {
    scan(source, { start: cursor, end: source.length }, edits);
  }

  let output = "";
  cursor = 0;
  for (const edit of edits) {
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
