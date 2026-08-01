#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "错误：当前目录不是 git 仓库"
  exit 1
fi

git add -A

if git diff --cached --quiet; then
  echo "没有可提交的更改"
  exit 0
fi

git commit -m "脚本推送"
git push

echo "推送完成"
