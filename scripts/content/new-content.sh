#!/bin/sh

gum style \
  --border normal \
  --margin "1 0" \
  --padding "0 1" \
  "创建新内容"

category=$(
  gum choose \
    --header "类别" \
    "艺术" \
    "计算机" \
    "数学" \
    "小说" \
    "哲学"
)
title=$(
  gum input \
    --header "$category" \
    --prompt "标题: " \
    --placeholder "新文章"
)
tags=$(
  gum input \
    --header "$category - $title" \
    --prompt "标签: " \
    --placeholder "第一个标签, 第二个标签"
)
summary=$(
  gum write \
    --header "$category - [$title]: $tags" \
    --placeholder "总结"
)

kind_from_category() {
  case "$1" in
    艺术)   echo "art"  ;;
    计算机) echo "cs"   ;;
    数学)   echo "math" ;;
    小说)   echo "nov"  ;;
    哲学)   echo "phil" ;;
  esac
}

yaml_list_from_csv_line() {
  printf "%s\n" "$1" |
  yq 'split(",") | map(trim)' - |
  sed 's/^/  /'
}

kind=$(kind_from_category "$category")
path="posts/${kind}/${title}.md"

HUGO_TITLE="$title" \
HUGO_CATEGORY="$category" \
HUGO_TAGS="$(yaml_list_from_csv_line "$tags")" \
HUGO_SUMMARY="$summary" \
hugo new content "$path"

if gum confirm "是否打开编辑器 ($EDITOR)"; then
  $EDITOR "content/${path}"
fi
