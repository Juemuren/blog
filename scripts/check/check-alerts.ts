import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const ALERTS = "(Note|Tip|Warning)";
const LETTERS = "[A-Za-z]+";
const markdown = unified().use(remarkParse);

const rules = [
  {
    pattern: new RegExp(`^\\[!${LETTERS}\\][-+]+`),
    description: "Alerts 后不允许紧接 + 或 - 符号",
  },
  {
    pattern: new RegExp(`^\\[!${LETTERS}\\]\\s*$`),
    description: "Alerts 后缺少标题",
  },
  {
    pattern: new RegExp(`^\\[!(?!${ALERTS}\\])${LETTERS}\\]`),
    description: `Alerts 类型仅允许 ${ALERTS} 且大小写敏感`,
  },
];

function checkAlerts(source: string, path: string): boolean {
  let failed = false;
  visit(markdown.parse(source), "blockquote", (quote) => {
    const first = quote.children[0];
    if (first?.type !== "paragraph") return;

    const position = first.position;
    if (position?.start.offset === undefined) return;
    const line = source.slice(position.start.offset).split(/\r?\n/, 1)[0];
    const lineNumber = position.start.line;

    for (const { pattern, description } of rules) {
      if (!pattern.test(line)) continue;
      console.error(`${path}:${lineNumber}: ${line}`);
      console.error(`[ERROR] ${description}`);
      failed = true;
    }
  });
  return failed;
}

// 遍历目录寻找 Markdown 文件
async function* markdownFiles(path: string): AsyncGenerator<string> {
  if ((await Deno.stat(path)).isFile) {
    yield path;
    return;
  }

  for await (const entry of Deno.readDir(path)) {
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory) yield* markdownFiles(child);
    else if (entry.isFile && /\.(?:md|markdown)$/i.test(entry.name)) {
      yield child;
    }
  }
}

if (import.meta.main) {
  if (Deno.args.length !== 1) {
    console.error("用法：deno task check-alerts <文件或目录>");
    Deno.exit(2);
  }
  try {
    let failed = false;
    for await (const path of markdownFiles(Deno.args[0])) {
      if (checkAlerts(await Deno.readTextFile(path), path)) failed = true;
    }
    if (failed) Deno.exit(1);
  } catch (error) {
    console.error(`[ERROR] 无法完成检查：${error}`);
    Deno.exit(2);
  }
}
