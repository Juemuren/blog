#!/bin/sh

TEMP_MD=".*\.temp\.md"
TEMP_TIKZ=".*-tikz-.*"
TEMP_MERMAID=".*-mermaid-.*"

PATTERN="$TEMP_MD|$TEMP_TIKZ|$TEMP_MERMAID"

fd --no-ignore-vcs \
  --type file "$PATTERN" \
  --exec-batch rm
