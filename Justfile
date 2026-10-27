set default-list

SOURCE := 'content'

# 本地开发
dev:
    hugo server \
        --environment development \
        --buildDrafts \
        --renderToMemory

# 本地调试
debug:
    hugo server \
        --environment development \
        --buildDrafts \
        --renderToMemory \
        --disableFastRender \
        --disableLiveReload

# 本地构建
build port="1313":
    TZ=Asia/Shanghai hugo build \
        --environment production \
        --cleanDestinationDir \
        --gc \
        --minify \
        --baseURL "http://localhost:{{ port }}/blog/" \
        --cacheDir "{{ justfile_directory() }}/.hugo_cache"

# 本地预览
preview port="1313": (build port)
    miniserve public \
        --index index.html \
        --route-prefix blog \
        --interfaces 127.0.0.1 \
        --port "{{ port }}"

new:
    ./scripts/content/new-content.sh

clean:
    ./scripts/maintenance/clean-tmp.sh

code-check: type-check web-check script-check ast-check
docs-check: md-check spell-check punct-check

type-check:
    deno check --no-lock --config tsconfig.base.json content assets/ts assets/schema

web-check:
    biome check .

web-fix:
    biome check . --fix

script-check:
    deno lint
    deno fmt --check

script-fix:
    deno fmt

ast-check:
    ast-grep scan --report-style short

ast-fix:
    ast-grep scan --interactive

md-check:
    rumdl check "{{ SOURCE }}"

spell-check:
    typos "{{ SOURCE }}"

punct-check:
    autocorrect "{{ SOURCE }}" --lint

ocd-check:
    deno task check-alerts "{{ SOURCE }}"

export-standalone file:
    ./scripts/export/export-standalone.sh "{{ file }}" "output/{{ file_stem(file) }}/{{ file_name(file) }}"

publish-zhihu file: (export-standalone file)
    ./scripts/maintenance/publish-zhihu.sh "output/{{ file_stem(file) }}/{{ file_name(file) }}"

delete-deployments:
    ./scripts/maintenance/delete-deployments.sh
