#!/bin/bash

shopt -s nullglob

cd "$1" || exit

# Compile TikZ
for tex in *-tikz-*.tex; do
    latex "$tex" -quiet
    dvisvgm "${tex%.tex}.dvi" --verbosity=0
    rm "${tex%.tex}.tex" "${tex%.tex}.dvi" "${tex%.tex}.log" "${tex%.tex}.aux"
    echo "Saved ${tex%.tex}.svg"
done

# Render Mermaid
for mmd in *-mermaid-*.mmd; do
    mmdc -i "$mmd" -o "${mmd%.mmd}.svg" -b transparent -q
    rm "${mmd%.mmd}.mmd"
    echo "Saved ${mmd%.mmd}.svg"
done
