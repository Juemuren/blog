#!/bin/bash
# shellcheck disable=SC1091
source .env

deployment_ids=$(
  curl -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    "https://api.github.com/repos/$OWNER/$REPO/deployments" |
  jq -r '.[].id'
)

for deployment_id in $deployment_ids; do
  id=$(echo "$deployment_id" | tr -d '\r')
  echo "Deleting [$id]"

  curl -L \
    -X DELETE \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-GitHub-Api-Version: 2026-03-10" \
    "https://api.github.com/repos/$OWNER/$REPO/deployments/$id"
done
