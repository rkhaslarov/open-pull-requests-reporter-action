"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryPRs = exports.ReviewStates = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
exports.ReviewStates = {
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    APPROVED: 'APPROVED'
};
async function queryPRs(token) {
    try {
        const octokit = new github.GitHub(token);
        const response = await octokit.graphql(`query prs($owner: String!, $repo: String!) {
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
              commits(last: 1) {
                nodes {
                  commit {
                    authoredDate
                    committedDate
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
      }`, {
            ...github.context.repo,
            headers: {
                accept: `application/vnd.github.shadow-cat-preview+json`
            }
        });
        return response && response?.repository;
    }
    catch (error) {
        core.error(`Could not perform github query: ${error.message}`);
        throw error;
    }
}
exports.queryPRs = queryPRs;
