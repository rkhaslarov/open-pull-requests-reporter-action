import * as core from '@actions/core'
import * as github from './api'
import { differenceInCalendarDays } from 'date-fns'
import { format } from 'timeago.js'

export interface BlockMessage {
  username: string
  icon_emoji: string
  blocks: object[]
}

function formatPullRequest(pr: github.PullRequest): string {
  const stalePrDays = (Number(core.getInput('stale-pr')) ?? 7) * -1
  const lastCommitDateString = pr.commits.nodes[0].commit.committedDate
  const lastCommitDate = new Date(lastCommitDateString)
  const isStalePR =
    differenceInCalendarDays(lastCommitDate, Date.now()) <= stalePrDays

  const dateString = isStalePR
    ? `${format(lastCommitDateString, 'en_US')} ⚠️`
    : `${format(lastCommitDateString, 'en_US')}`

  return `\n📌 <${pr.url}|${pr.title}> | ${dateString}`
}

function formatPullRequestAuthor(login: string): string {
  return `\n👤 <https://github.com/${login}|${login}>: `
}

export function formatPullRequests(
  groupedPullRequests: Record<string, github.PullRequest[]>
): object[] {
  return Object.keys(groupedPullRequests).map((author: string) => {
    const text = formatPullRequestAuthor(author).concat(
      groupedPullRequests[author].map(formatPullRequest).join('')
    )

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text
      }
    }
  })
}

export function formatSlackMessage(
  repoName: string,
  blocks: object[],
  totalPRs: number,
  readyPRs: number
): BlockMessage {
  return {
    username: 'PR Reporter',
    icon_emoji: ':rolled_up_newspaper:',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\n*${repoName}* has ${readyPRs} PRs ready for review`
        }
      },
      {
        type: 'divider'
      },
      ...blocks,
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `You have *${totalPRs}* open PRs and *${readyPRs}* ready for review`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<https://github.com/${repoName}/pulls|Explore on GitHub>*`
        }
      },
      {
        type: 'divider'
      }
    ]
  }
}
