#!/bin/bash
# shellcheck disable=SC1091
source .env

file=$1

wechatsync sync "$file" -p zhihu
