import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import { codes } from "micromark-util-symbol";
import type {
  Construct,
  Extension as MicromarkExtension,
  State,
} from "micromark-util-types";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

type DelimiterRange = { start: number; end: number };

type PositionedMath = {
  value: string;
  delimiters?: {
    opening: DelimiterRange;
    closing: DelimiterRange;
  };
  position?: {
    start: { line: number; column: number; offset?: number };
    end: { line: number; column: number; offset?: number };
  };
};

export type TextInlineMathNode = PositionedMath & {
  type: "textInlineMath";
};
export type TextMathNode = PositionedMath & {
  type: "textMath";
};

declare module "mdast" {
  interface PhrasingContentMap {
    textInlineMath: TextInlineMathNode;
    textMath: TextMathNode;
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
    textMath: "textMath";
  }
}

const delimiterLength = 2;

function setDelimiterRanges(
  node: PositionedMath,
  openingStart: number | undefined,
  closingStart: number | undefined,
): void {
  if (openingStart === undefined || closingStart === undefined) return;
  node.delimiters = {
    opening: { start: openingStart, end: openingStart + delimiterLength },
    closing: { start: closingStart, end: closingStart + delimiterLength },
  };
}

const isLineEnd = (code: number | null): boolean =>
  code === codes.eof ||
  code === codes.carriageReturnLineFeed ||
  code === codes.lineFeed ||
  code === codes.carriageReturn;

const isSpaceOrTab = (code: number | null): boolean =>
  code === codes.space ||
  code === codes.horizontalTab;

// This text construct recognizes \(...\) inline.
// Text parsing begins after inlineCode and inlineMath have been consume.
const textInlineMath: Construct = {
  name: "textInlineMath",
  tokenize(effects, ok, nok) {
    return start;

    function start(code: number | null) {
      effects.enter("textInlineMath");
      effects.consume(code);
      return openingParenthesis;
    }
    function openingParenthesis(code: number | null) {
      if (code !== codes.leftParenthesis) return nok(code);
      effects.consume(code);
      return body;
    }
    function body(code: number | null): State | undefined {
      if (code === codes.eof) return nok(code);
      if (isLineEnd(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return body;
      }
      if (code === codes.backslash) {
        effects.consume(code);
        return afterSlash;
      }
      effects.consume(code);
      return body;
    }
    function afterSlash(code: number | null): State | undefined {
      if (code === codes.eof) return nok(code);
      if (code === codes.rightParenthesis) {
        effects.consume(code);
        effects.exit("textInlineMath");
        return ok;
      }
      if (code === codes.backslash) {
        effects.consume(code);
        return body;
      }
      return body(code);
    }
  },
};

// This flow construct recognizes \[...\] block.
// Flow parsing begins after blockquote and list prefixes have been removed.
const textMath: Construct = {
  name: "textMath",
  concrete: true,
  tokenize(effects, ok, nok) {
    const interrupt = this.interrupt;
    const openingColumn = this.now().column;
    const currentColumn = () => this.now().column;
    return start;

    function start(code: number | null) {
      effects.enter("textMath");
      effects.consume(code);
      return openingBracket;
    }
    function openingBracket(code: number | null) {
      if (code !== codes.leftSquareBracket) return nok(code);
      effects.consume(code);
      return afterOpen;
    }
    function afterOpen(code: number | null) {
      if (isSpaceOrTab(code)) {
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
      if (code === codes.eof) return nok(code);
      effects.enter("lineEnding");
      effects.consume(code);
      effects.exit("lineEnding");
      return lineStart;
    }
    function lineStart(code: number | null): State | undefined {
      if (code !== codes.backslash && !isSpaceOrTab(code)) return content(code);
      // A failed close attempt returns to content at the same position.
      return effects.attempt(
        { tokenize: closingLine, partial: true },
        done,
        content,
      )(code);
    }
    function content(code: number | null): State | undefined {
      if (isLineEnd(code)) return lineEnd(code);
      effects.consume(code);
      return content;
    }
    // The closing delimiter aligns with the opening delimiter.
    function closingLine(
      closeEffects: typeof effects,
      closeOk: typeof ok,
      closeNok: typeof nok,
    ) {
      return indentation;
      function indentation(code: number | null): State | undefined {
        if (isSpaceOrTab(code) && currentColumn() < openingColumn) {
          closeEffects.consume(code);
          return indentation;
        }
        if (currentColumn() !== openingColumn) return closeNok(code);
        return slash(code);
      }
      function slash(code: number | null) {
        if (code !== codes.backslash) return closeNok(code);
        closeEffects.consume(code);
        return bracket;
      }
      function bracket(code: number | null) {
        if (code !== codes.rightSquareBracket) return closeNok(code);
        closeEffects.consume(code);
        return closeEffects.check(
          { tokenize: checkTrailingSpace, partial: true },
          closeOk,
          closeNok,
        );
      }
      function checkTrailingSpace(
        checkEffects: typeof effects,
        checkOk: typeof ok,
        checkNok: typeof nok,
      ) {
        return trailingSpace;
        function trailingSpace(code: number | null): State | undefined {
          if (isSpaceOrTab(code)) {
            checkEffects.consume(code);
            return trailingSpace;
          }
          return isLineEnd(code) ? checkOk(code) : checkNok(code);
        }
      }
    }
    function done(code: number | null) {
      effects.exit("textMath");
      return ok(code);
    }
  },
};

const micromarkExtension: MicromarkExtension = {
  text: { [codes.backslash]: textInlineMath },
  flow: { [codes.backslash]: textMath },
};
const fromMarkdownExtension: FromMarkdownExtension = {
  enter: {
    textInlineMath(token) {
      this.enter({ type: "textInlineMath", value: "" }, token);
    },
    textMath(token) {
      this.enter({ type: "textMath", value: "" }, token);
    },
  },
  exit: {
    textInlineMath(token) {
      const node = this.stack.at(-1) as TextInlineMathNode;
      const raw = this.sliceSerialize(token);
      node.value = raw.slice(delimiterLength, -delimiterLength);
      setDelimiterRanges(
        node,
        token.start.offset,
        token.end.offset === undefined
          ? undefined
          : token.end.offset - delimiterLength,
      );
      this.exit(token);
    },
    textMath(token) {
      const node = this.stack.at(-1) as TextMathNode;
      const raw = this.sliceSerialize(token);
      node.value = raw.slice(delimiterLength, -delimiterLength)
        .replace(/^[ \t]*(?:\r\n|\r|\n)/, "")
        .replace(/(?:\r\n|\r|\n)[ \t]*$/, "");
      setDelimiterRanges(
        node,
        token.start.offset,
        token.end.offset === undefined
          ? undefined
          : token.end.offset - delimiterLength,
      );
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
