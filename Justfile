set default-list

SOURCE := 'content'

# 本地开发：包含草稿，不写入磁盘，使用完整重渲染
dev:
    hugo server \
        --environment development \
        --buildDrafts --renderToMemory \
        --disableFastRender \
        --printPathWarnings

# 本地构建：与 .github\workflows\ci.yaml 中的构建对齐
build port="1313":
    TZ=Asia/Shanghai hugo build \
        --environment production \
        --cleanDestinationDir \
        --gc \
        --minify \
        --baseURL "http://localhost:{{ port }}/blog/" \
        --cacheDir "{{ justfile_directory() }}/.hugo_cache"

# 本地预览：预览本地构建产物
preview port="1313": (build port)
    miniserve public \
        --index index.html \
        --route-prefix blog \
        --interfaces 127.0.0.1 \
        --port "{{ port }}"

new:
    ./scripts/content/new-content.sh

check:
    rumdl check "{{ SOURCE }}"

spell-check:
    typos "{{ SOURCE }}"
    cspell lint "{{ SOURCE }}"
    # ltex-cli-plus --client-configuration .ltex.json "{{ SOURCE }}"

punctuation-check:
    autocorrect "{{ SOURCE }}" --lint

ocd-check:
    ./scripts/check/check-alerts.sh "{{ SOURCE }}"

sort-dictionary:
    ./scripts/check/sort-dictionary.sh .cspell
    ./scripts/check/sort-dictionary.sh .ltex

export-standalone file:
    ./scripts/export/export-standalone.sh "{{ file }}" "output/{{ file_stem(file) }}/{{ file_name(file) }}"

publish-zhihu file: (export-standalone file)
    ./scripts/maintenance/publish-zhihu.sh "output/{{ file_stem(file) }}/{{ file_name(file) }}"

delete-deployments:
    ./scripts/maintenance/delete-deployments.sh
