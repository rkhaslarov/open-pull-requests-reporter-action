# Open Pull Requests Slack Reporter

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)

Use this action for reporting open pull requests via slack webhook

## Usage

Installation is pretty simple, create separate workflow based on cron job:

```yaml
   name: Open Pull Requests Reporter
   on:
     schedule:
       - cron: "00 09,13 * * 1-5"
     workflow_dispatch:
   jobs:
     send-slack-notification:
       name: Open Pull Requests Report
       runs-on: ubuntu-orca-c4r8
       steps:
         - name: 'Notify in Slack'
           uses: rkhaslarov/open-pull-requests-reporter-action@v1.0.1
           with:
             repo-token: ${{ secrets.GITHUB_TOKEN }}
             slack-webhook: ${{ secrets.OPEN_PULL_REQUESTS_SLACK_WEBHOOK }}
             exclude-labels: 'LABEL' # PRs with given labels will be excluded
             stale-pr: 2 # Number of days when PR is considered as stale
```
