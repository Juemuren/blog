set default-list := true

SOURCE := 'content'

server: clean
    hugo server

build: clean
    hugo build --cleanDestinationDir

new:
    ./scripts/new-content.sh

clean:
    ./scripts/clean-temp.sh

check:
    rumdl check "{{ SOURCE }}"

spell-check:
    typos "{{ SOURCE }}"
    cspell lint "{{ SOURCE }}"
    # ltex-cli-plus --client-configuration .ltex.json "{{ SOURCE }}"

punctuation-check:
    autocorrect "{{ SOURCE }}" --lint

ocd-check:
    ./scripts/check-alerts.sh "{{ SOURCE }}"

sort-dictionary:
    ./scripts/sort-dictionary.sh .cspell
    ./scripts/sort-dictionary.sh .ltex

publish-zhihu file: (export-standalone file)
    ./scripts/publish-zhihu.sh "{{ without_extension(file) }}.temp.md"

export-standalone file:
    ./scripts/handle-md.sh "{{ file }}" "{{ without_extension(file) }}.temp.md"
    ./scripts/export-svg.sh "{{ parent_directory(file) }}"

delete-deployments:
    ./scripts/delete-deployments.sh
