set default-list := true

SOURCE := 'content'

server: clean
    hugo server

build: clean
    hugo build --cleanDestinationDir

new:
    ./scripts/content/new-content.sh

clean:
    ./scripts/maintenance/clean-temp.sh

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
    ./scripts/export/handle-md.sh "{{ file }}" "{{ without_extension(file) }}.temp.md"
    ./scripts/export/export-svg.sh "{{ parent_directory(file) }}"

publish-zhihu file: (export-standalone file)
    ./scripts/maintenance/publish-zhihu.sh "{{ without_extension(file) }}.temp.md"

delete-deployments:
    ./scripts/maintenance/delete-deployments.sh
