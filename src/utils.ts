import * as github from './api'

export const PRStatuses = {
  REVIEWED: 'REVIEWED',
  CHANGES_REQUIRED: 'CHANGES_REQUIRED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  DRAFT: 'DRAFT'
}

export function getPullRequestStatus(pr: github.PullRequest): string {
  if (pr.isDraft) {
    return PRStatuses.DRAFT
  }

  if (pr.reviews.totalCount >= 2) {
    return PRStatuses.REVIEWED
  }

  if (
    pr.reviews.nodes.some(
      review => review.state === github.ReviewStates.CHANGES_REQUESTED
    )
  ) {
    return PRStatuses.CHANGES_REQUIRED
  }

  return PRStatuses.REVIEW_REQUIRED
}

export function isPullRequestReadyForReview(
  pr: github.PullRequest,
  excludeLabels: string[]
): boolean {
  const status = getPullRequestStatus(pr)
  const excludedByLabels = pr.labels.nodes.some(label =>
    excludeLabels.includes(label.name)
  )

  return status === PRStatuses.REVIEW_REQUIRED && !excludedByLabels
}

export function groupPullRequestsByAuthor(
  prs: github.PullRequest[]
): Record<string, github.PullRequest[]> {
  return prs.reduce(
    (acc, cur) => {
      if (acc[cur.author.login]) {
        acc[cur.author.login].push(cur)
      } else {
        acc[cur.author.login] = []
      }

      return acc
    },
    {} as Record<string, github.PullRequest[]>
  )
}
