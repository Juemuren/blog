#!/bin/bash

set -e
shopt -s nullglob

SCRIPT_DIR=$(dirname "$0")

input=$1
output=$2

output_dir=$(dirname "$output")
mkdir -p "$output_dir"

# Convert Markdown
pandoc "$input" -o "$output" \
  --standalone \
  --from markdown \
  --to markdown-smart-simple_tables-grid_tables-multiline_tables-raw_attribute \
  --lua-filter="$SCRIPT_DIR/extract-codeblocks.lua" \
  --lua-filter="$SCRIPT_DIR/shift-headers.lua" \
  --lua-filter="$SCRIPT_DIR/remove-comments.lua" \
  --wrap=preserve

cd "$output_dir"

# Compile TikZ
for tex in *-tikz-*.tex; do
  latex -interaction=batchmode -halt-on-error "$tex" >/dev/null
  dvisvgm "${tex%.tex}.dvi" --verbosity=3
  rm "$tex" "${tex%.tex}.dvi" "${tex%.tex}.log" "${tex%.tex}.aux"
  echo "Saved ${tex%.tex}.svg"
done

# Compile CeTZ
for typ in *-cetz-*.typ; do
  typst compile "$typ" "${typ%.typ}.svg"
  rm "$typ"
  echo "Saved ${typ%.typ}.svg"
done

# Compile Mermaid
for mmd in *-mermaid-*.mmd; do
  mmdc -i "$mmd" -o "${mmd%.mmd}.svg" -b transparent -q
  rm "$mmd"
  echo "Saved ${mmd%.mmd}.svg"
done
