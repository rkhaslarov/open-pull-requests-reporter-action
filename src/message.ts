import * as core from '@actions/core'
import * as github from './api'
import { differenceInCalendarDays } from 'date-fns'
import { format } from 'timeago.js'
export interface BlockMessage {
  username: string
  icon_emoji: string
  blocks: object[]
}

function getReviewStatus(pr: github.PullRequest): string {
  if (pr.reviews.totalCount === 0) {
    return '*No reviews*'
  } else if (
    pr.reviews.nodes.some(
      review => review.state === github.ReviewStates.CHANGES_REQUESTED
    )
  ) {
    return '*Changes Requested*'
  } else {
    return `*${pr.reviews.totalCount} approvals*`
  }
}

export function formatSinglePR(pr: github.PullRequest): string {
  const stalePrDays = (Number(core.getInput('stale-pr')) ?? 7) * -1
  const createdAt = new Date(pr.createdAt)
  const status = getReviewStatus(pr)
  const isStalePR =
    differenceInCalendarDays(createdAt, Date.now()) <= stalePrDays

  const dateString = isStalePR
    ? `🚨 ${format(pr.createdAt, 'en_US')} 🚨`
    : `${format(pr.createdAt, 'en_US')}`

  return `\n👉 <${pr.url}|${pr.title}> | ${status} | ${dateString}`
}

export function formatSlackMessage(
  repoName: string,
  text: string,
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
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text
        }
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
        type: 'divider'
      }
    ]
  }
}
