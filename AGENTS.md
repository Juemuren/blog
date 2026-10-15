# AGENTS.md

本项目是一个使用 Hugo 构建的博客，主题为 PaperMod。

## 目录结构

```txt
.
├── archetypes  # Markdown 模板
├── assets      # 运行在浏览器环境的代码
├── content     # Markdown 文章
├── i18n        # 翻译文案
├── layouts     # HTML 模板
├── scripts     # 运行在本地环境的代码
├── static      # 静态资源
└── themes      # 主题
```

## 检查

### 浏览器环境的代码检查

`assets` 目录下的代码在浏览器环境运行。

修改 `assets` 目录下的 CSS / JS / TS 文件后，使用 `biome` 进行静态检查和格式化

```sh
biome check assets --fix
```

修改 `assets/ts` 目录下的 TS 文件后，使用 `deno` 进行类型检查

```sh
deno check --config assets/ts/*/tsconfig.json assets/ts/*/example.ts
```

### 本地环境的代码检查

`scripts` 目录下的代码在本地环境运行。

修改 `scripts` 目录下的 JS / TS 文件后，使用 `deno` 进行静态检查和格式化

```sh
deno fmt scripts
deno lint scripts
```

修改 `scripts` 目录下的 TS 文件后，使用 `deno` 进行类型检查

```sh
deno check --config deno.json scripts/example.ts
```

### 博客的构建检查

修改 `assets` 或 `layouts` 目录下的代码后，使用 `hugo` 进行构建检查。

### 博客的浏览器检查

修改 `assets` 或 `layouts` 目录下的代码后，如果视觉或逻辑变动较大，需要验证浏览器行为，请使用 `playwright` 进行浏览器检查。
