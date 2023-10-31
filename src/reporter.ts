import * as core from '@actions/core'
import axios from 'axios'
import * as github from './api'
import { formatSlackMessage, formatSinglePR } from './message'

export async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token')
    const slackWebhook: string = core.getInput('slack-webhook')
    const notifyEmpty: boolean = core.getInput('notify-empty') === 'true'
    const excludeLabels: string[] = core.getInput('exclude-labels')?.split(',')

    const response = await github.queryPRs(token)

    core.debug('Successful GraphQL response')

    const pullRequests = response?.pullRequests.nodes
    const repoName = response?.nameWithOwner
    const readyPRS = pullRequests.filter((pr: github.PullRequest) => {
      const excluded =
        excludeLabels &&
        pr.labels.nodes.some(label => excludeLabels.includes(label.name))
      return !pr.isDraft && !excluded
    })

    let text = ''

    if (readyPRS.length === 0) {
      if (notifyEmpty) {
        text = '👍 No PRs are waiting for review!'
      } else {
        return
      }
    }

    for (const pr of readyPRS) {
      text = text.concat(formatSinglePR(pr))
    }

    const message = formatSlackMessage(
      repoName,
      text,
      pullRequests.length,
      readyPRS.length
    )

    await axios.post(slackWebhook, message)
    core.debug('Successful Slack webhook response')
  } catch (error: any) {
    core.setFailed(error.message)
  }
}
