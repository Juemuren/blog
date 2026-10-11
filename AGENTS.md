# AGENTS.md

本项目是一个使用 Hugo 构建的博客，主题为 PaperMod。

## 目录结构

```txt
.
├── archetypes  # Markdown 模板
├── assets      # CSS / JS / TS 文件
├── content     # Markdown 文章
├── i18n        # 翻译文案
├── layouts     # Hugo HTML 模板
├── scripts     # 脚本
├── static      # 静态资源
└── themes      # PaperMod 主题
```

## 检查

修改 `assets` 目录下的 CSS / JS / TS 文件后，使用 `biome` 进行静态检查和格式化

```sh
biome check . --fix
```

修改 `assets/ts` 目录下 TS 文件后，使用 `deno` 进行类型检查

```sh
deno check --config assets/ts/*/tsconfig.json assets/ts/*/a.ts assets/ts/*/b.ts
```

修改 `assets` 或 `layouts` 目录下的代码后，使用 `hugo` 进行构建检查。

如果进行了较大的视觉或逻辑改动，需要验证浏览器行为，可以使用 `playwright` 进行浏览器检查。
