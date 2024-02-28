import * as core from '@actions/core'
import * as github from '@actions/github'

export const ReviewStates = {
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  APPROVED: 'APPROVED'
} as const

export interface GraphQLPullRequestResponse {
  nameWithOwner: string
  pullRequests: {
    nodes: PullRequest[]
    totalCount: number
  }
}

export interface PullRequest {
  id: string
  title: string
  url: string
  createdAt: string
  updatedAt: string
  isDraft: boolean
  reviews: {
    totalCount: number
    nodes:
      | [
          {
            state: keyof typeof ReviewStates
          }
        ]
      | []
  }
  comments: {
    totalCount: number
  }
  author: {
    login: string
  }
  headRef: {
    name: string
  }
  commits: {
    nodes: object[]
  }
  labels: {
    nodes:
      | [
          {
            name: string
          }
        ]
      | []
  }
}

export async function queryPRs(
  token: string
): Promise<GraphQLPullRequestResponse> {
  try {
    const octokit = new github.GitHub(token)

    const response = await octokit.graphql<{
      repository: GraphQLPullRequestResponse
    }>(
      `query prs($owner: String!, $repo: String!) {
        repository(owner:$owner, name:$repo) {
          nameWithOwner,
          pullRequests(first: 100, states: OPEN) {
            nodes {
              id
              title
              url
              createdAt
              updatedAt
              isDraft
              reviews(first: 10, states: [CHANGES_REQUESTED, APPROVED]) {
                totalCount
                nodes {
                  state
                }
              }
              comments {
                totalCount
              }
              headRef {
                name
              }
              author {
                login
              }
              commits(first: 10) {
                nodes {
                  commit {
                    status {
                      id
                      state
                    }
                  }
                }
              }
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
            totalCount
          }
        }
      }`,
      {
        ...github.context.repo,
        headers: {
          accept: `application/vnd.github.shadow-cat-preview+json`
        }
      }
    )

    return response && response?.repository
  } catch (error: any) {
    core.error(`Could not perform github query: ${error.message}`)
    throw error
  }
}
