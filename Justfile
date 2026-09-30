set default-list := true

SOURCE := 'content'

server:
    hugo server

build:
    hugo build --cleanDestinationDir

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
