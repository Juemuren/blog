#!/bin/bash

set -e

if [ "$#" -ne 1 ]; then
  printf '用法：%s <文件或目录>\n' "$0" >&2
  exit 2
fi

path=$1

LETTERS="[A-Za-z]+"
ALERTS="(Note|Tip|Warning)"

check_rule() {
  local pattern=$1 description=$2 status

  if rg --case-sensitive --line-number --with-filename -P -- "$pattern" "$path"; then
    printf '[ERROR] %s\n' "$description" >&2
    exit 1
  else
    status=$?
    # rg 返回 1 表示没有匹配；其他非零状态表示检查执行失败。
    if [ "$status" -ne 1 ]; then
      printf '[ERROR] 无法完成检查：%s\n' "$description" >&2
      exit "$status"
    fi
  fi
}

check_rule "\[!$LETTERS\][-+]+" 'Alerts 后不允许紧接 + 或 - 符号'
check_rule "\[!$LETTERS\]\s*$" 'Alerts 后缺少标题'
check_rule "\[!(?!$ALERTS\])$LETTERS\]" "Alerts 类型仅允许 $ALERTS 且大小写敏感"

exit 0
