# AI PR Detector

The action scans every commit returned by
`GET /repos/{owner}/{repo}/pulls/{pull_number}/commits` to look for:

- Known AI bot committer emails
- Known AI bot commit message patterns

## Usage

```yaml
name: Label AI-generated PRs

on:
  pull_request_target:
    types: [opened, reopened, synchronize]

permissions:
  contents: read
  pull-requests: read
  issues: write

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: sargunv/ai-pr-detector@v1
        with:
          label: ai-generated
```

Pin this action to a release tag or full commit SHA when using
`pull_request_target`, because that event runs with elevated repository
permissions.

The action also works on `pull_request` events. If `label` is empty, the action
only sets the `ai-detected` output. If `label` is set, the token needs
`issues: write`; forked PRs on `pull_request` usually receive a read-only token,
so labeling is best used with `pull_request_target`, trusted/internal PRs, or a
separately scoped token.

## Inputs

- `label`: Label to add when AI is detected. Defaults to empty, which skips
  labeling. The label must already exist in the repository; label API failures
  fail the workflow.
- `github-token`: Token for GitHub API calls. Defaults to `${{ github.token }}`.

## Outputs

- `ai-detected`: `true` when any detector finds an AI signal, otherwise `false`.

## Development

```sh
mise install
mise run ci
```
