#!/bin/bash

set -e
shopt -s nullglob

SCRIPT_DIR=$(dirname "$0")

input=$1
output=$2

pandoc "$input" -o "$output" \
  --standalone \
  --from markdown \
  --to markdown-smart-simple_tables-grid_tables-multiline_tables-raw_attribute \
  --lua-filter="$SCRIPT_DIR/extract-codeblocks.lua" \
  --lua-filter="$SCRIPT_DIR/shift-headers.lua" \
  --lua-filter="$SCRIPT_DIR/remove-comments.lua" \
  --wrap=preserve

cd "$(dirname "$input")"

# Compile TikZ
for tex in *-tikz-*.tex; do
  latex -interaction=batchmode -halt-on-error "$tex" >/dev/null
  dvisvgm "${tex%.tex}.dvi" --verbosity=3
  rm "$tex" "${tex%.tex}.dvi" "${tex%.tex}.log" "${tex%.tex}.aux"
  echo "Saved ${tex%.tex}.svg"
done

# Render Mermaid
for mmd in *-mermaid-*.mmd; do
  mmdc -i "$mmd" -o "${mmd%.mmd}.svg" -b transparent -q
  rm "$mmd"
  echo "Saved ${mmd%.mmd}.svg"
done
