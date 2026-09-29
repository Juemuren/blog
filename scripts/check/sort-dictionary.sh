#!/bin/sh

path=$1

fd --search-path "$path" --exec "$(command -v sort)" {} --output {}
