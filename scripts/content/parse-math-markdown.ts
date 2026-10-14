import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type {
  Construct,
  Extension as MicromarkExtension,
  State,
} from "micromark-util-types";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

type PositionedMath = {
  value: string;
  position?: {
    start: { line: number; column: number; offset?: number };
    end: { line: number; column: number; offset?: number };
  };
};
export type TextInlineMathNode = PositionedMath & {
  type: "textInlineMath";
  delimiter: "(" | "[";
};
export type TextMathNode = PositionedMath & { type: "textMath" };

declare module "mdast" {
  interface PhrasingContentMap {
    textInlineMath: TextInlineMathNode;
  }
  interface BlockContentMap {
    textMath: TextMathNode;
  }
  interface RootContentMap {
    textInlineMath: TextInlineMathNode;
    textMath: TextMathNode;
  }
}

declare module "micromark-util-types" {
  interface TokenTypeMap {
    textInlineMath: "textInlineMath";
    textInlineMathIgnored: "textInlineMathIgnored";
    textMath: "textMath";
    textMathData: "textMathData";
    textMathClose: "textMathClose";
  }
}

const isLineEnd = (code: number | null): boolean =>
  code === null || code === -3 || code === -4 || code === -5;

// A text construct runs inside ordinary phrasing content. Code spans and
// existing dollar math consume their contents before this construct sees them.
const textInlineMath: Construct = {
  name: "textInlineMath",
  tokenize(effects, ok, nok) {
    let token: ReturnType<typeof effects.enter>;
    let close: number;
    let invalid = false;
    return start;

    function start(code: number | null) {
      token = effects.enter("textInlineMath");
      effects.consume(code);
      return openingMark;
    }
    function openingMark(code: number | null) {
      if (code !== 40 && code !== 91) return nok(code);
      close = code === 40 ? 41 : 93;
      effects.consume(code);
      return body;
    }
    function body(code: number | null): State | undefined {
      if (code === null || (isLineEnd(code) && close !== 41)) return nok(code);
      if (isLineEnd(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return body;
      }
      if (code === 92) {
        effects.consume(code);
        return afterSlash;
      }
      effects.consume(code);
      return body;
    }
    function afterSlash(code: number | null): State | undefined {
      if (code === null || (isLineEnd(code) && close !== 41)) return nok(code);
      if (code === 40 || code === 91) invalid = true;
      if (code === 41 || code === 93) {
        effects.consume(code);
        if (invalid || code !== close) token.type = "textInlineMathIgnored";
        effects.exit("textInlineMath");
        return ok;
      }
      if (code === 92) {
        effects.consume(code);
        return body;
      }
      return body(code);
    }
  },
};

// Flow parsing begins after blockquote and list prefixes have been removed.
const textMath: Construct = {
  name: "textMath",
  concrete: true,
  tokenize(effects, ok, nok) {
    const interrupt = this.interrupt;
    return start;

    function start(code: number | null) {
      effects.enter("textMath");
      effects.consume(code);
      return openingBracket;
    }
    function openingBracket(code: number | null) {
      if (code !== 91) return nok(code);
      effects.consume(code);
      return afterOpen;
    }
    function afterOpen(code: number | null) {
      if (code === 32 || code === -2) {
        effects.consume(code);
        return afterOpen;
      }
      if (!isLineEnd(code)) return nok(code);
      if (interrupt) {
        effects.exit("textMath");
        return ok(code);
      }
      return lineEnd(code);
    }
    function lineEnd(code: number | null): State | undefined {
      if (code === null) return nok(code);
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return lineStart;
    }
    function lineStart(code: number | null): State | undefined {
      if (code === 92) {
        return effects.attempt(
          { tokenize: closingLine, partial: true },
          done,
          content,
        )(code);
      }
      return content(code);
    }
    function content(code: number | null): State | undefined {
      if (isLineEnd(code)) return lineEnd(code);
      effects.enter("textMathData");
      return data(code);
    }
    function data(code: number | null): State | undefined {
      if (isLineEnd(code)) {
        effects.exit("textMathData");
        return lineEnd(code);
      }
      effects.consume(code);
      return data;
    }
    function closingLine(
      closeEffects: typeof effects,
      closeOk: typeof ok,
      closeNok: typeof nok,
    ) {
      return slash;
      function slash(code: number | null) {
        closeEffects.enter("textMathClose");
        closeEffects.consume(code);
        return bracket;
      }
      function bracket(code: number | null) {
        if (code !== 93) return closeNok(code);
        closeEffects.consume(code);
        return end;
      }
      function end(code: number | null) {
        if (code === 32 || code === -2) {
          closeEffects.consume(code);
          return end;
        }
        if (!isLineEnd(code)) return closeNok(code);
        closeEffects.exit("textMathClose");
        return closeOk(code);
      }
    }
    function done(code: number | null) {
      effects.exit("textMath");
      return ok(code);
    }
  },
};

const micromarkExtension: MicromarkExtension = {
  text: { 92: textInlineMath },
  flow: { 92: textMath },
};
const fromMarkdownExtension: FromMarkdownExtension = {
  enter: {
    textInlineMath(token) {
      this.enter({ type: "textInlineMath", value: "", delimiter: "(" }, token);
    },
    textInlineMathIgnored(token) {
      this.enter({ type: "text", value: "" }, token);
    },
    textMath(token) {
      this.enter({ type: "textMath", value: "" }, token);
    },
  },
  exit: {
    textInlineMath(token) {
      const node = this.stack.at(-1) as TextInlineMathNode;
      const raw = this.sliceSerialize(token);
      node.value = raw.slice(2, -2);
      node.delimiter = raw[1] as "(" | "[";
      this.exit(token);
    },
    textInlineMathIgnored(token) {
      (this.stack.at(-1) as { value: string }).value = this.sliceSerialize(
        token,
      );
      this.exit(token);
    },
    textMath(token) {
      const node = this.stack.at(-1) as TextMathNode;
      const raw = this.sliceSerialize(token);
      node.value = raw.slice(2, raw.lastIndexOf(String.raw`\]`))
        .replace(/^[ \t]*(?:\r\n|\r|\n)/, "")
        .replace(/(?:\r\n|\r|\n)$/, "");
      this.exit(token);
    },
  },
};

const markdown = unified().use(remarkParse).use(remarkFrontmatter).use(
  remarkMath,
);
markdown.data("micromarkExtensions", [micromarkExtension]);
markdown.data("fromMarkdownExtensions", [fromMarkdownExtension]);

export function parseMathMarkdown(source: string) {
  return markdown.parse(source);
}
