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

    core.info(`Starting GraphQL request...`)

    const response = await github.queryPRs(token)

    core.info(`Successful GraphQL response: ${JSON.stringify(response)}`)

    const pullRequests = response?.pullRequests.nodes
    const repoName = response?.nameWithOwner
    const readyPRS = pullRequests.filter((pr: github.PullRequest) => {
      const excluded =
        excludeLabels &&
        pr.labels.nodes.some(label => excludeLabels.includes(label.name))
      return !pr.isDraft && !excluded
    })

    core.info(`PRs are ready for review: ${JSON.stringify(readyPRS)}`)

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

    core.info(`Formatting Slack webhook message for ${repoName}: ${text}`)

    const message = formatSlackMessage(
      repoName,
      text,
      pullRequests.length,
      readyPRS.length
    )

    core.info(`Sending message to Slack webhook: ${JSON.stringify(message)}`)

    await axios.post(slackWebhook, message)
    core.info('Successful Slack webhook response')
  } catch (error: any) {
    if (error.response) {
      core.setFailed(error.response.data)
    }

    core.setFailed(error.message)
  }
}
