#!/bin/sh

set -eu

TEMP_DIR=".tmp"

fd -HI -d 1 -E .gitignore --search-path "$TEMP_DIR" -X rm -r --
