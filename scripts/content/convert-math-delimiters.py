"""Replace LaTeX math delimiters in UTF-8 files."""

import argparse
from pathlib import Path


def convert_math_delimiters(content: bytes) -> bytes:
  return (
    content.replace(rb"\(", b"$")
    .replace(rb"\)", b"$")
    .replace(rb"\[", b"$$")
    .replace(rb"\]", b"$$")
  )


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(
    description="将 UTF-8 文件中的 LaTeX 数学分隔符替换为美元符号。"
  )
  parser.add_argument("files", nargs="+", type=Path, help="需要转换的文件路径")
  return parser.parse_args()


def main() -> None:
  args = parse_args()
  for path in args.files:
    original = path.read_bytes()
    converted = convert_math_delimiters(original)
    if converted != original:
      path.write_bytes(converted)


if __name__ == "__main__":
  main()
