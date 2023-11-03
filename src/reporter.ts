import * as core from '@actions/core'
import axios from 'axios'
import * as github from './api'
import { formatSlackMessage, formatPullRequests } from './message'
import { groupPullRequestsByAuthor, isPullRequestReadyForReview } from './utils'

export async function run(): Promise<void> {
  try {
    const token: string = core.getInput('repo-token')
    const slackWebhook: string = core.getInput('slack-webhook')
    const excludeLabels: string[] = core.getInput('exclude-labels')?.split(',')

    core.info(`Starting GraphQL request...`)

    const response = await github.queryPRs(token)
    const pullRequests = response?.pullRequests.nodes
    const repoName = response?.nameWithOwner
    const readyPullRequests = pullRequests.filter(pr =>
      isPullRequestReadyForReview(pr, excludeLabels)
    )

    if (readyPullRequests.length === 0) {
      return
    }

    core.info(`PRs are ready for review: ${JSON.stringify(readyPullRequests)}`)

    const groupedPullRequests = groupPullRequestsByAuthor(readyPullRequests)

    core.info(`Grouped PRs by Author: ${JSON.stringify(groupedPullRequests)}`)

    const blocks = formatPullRequests(groupedPullRequests)

    core.info(`Formatting Slack webhook message for ${repoName}: ${blocks}`)

    const message = formatSlackMessage(
      repoName,
      blocks,
      pullRequests.length,
      readyPullRequests.length
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
