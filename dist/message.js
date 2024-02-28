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
exports.formatSlackMessage = exports.formatPullRequests = void 0;
const core = __importStar(require("@actions/core"));
const date_fns_1 = require("date-fns");
const timeago_js_1 = require("timeago.js");
function formatPullRequest(pr) {
    const stalePrDays = (Number(core.getInput('stale-pr')) ?? 7) * -1;
    const updatedAt = new Date(pr.updatedAt);
    const isStalePR = (0, date_fns_1.differenceInCalendarDays)(updatedAt, Date.now()) <= stalePrDays;
    const dateString = isStalePR
        ? `${(0, timeago_js_1.format)(pr.updatedAt, 'en_US')} ⚠️`
        : `${(0, timeago_js_1.format)(pr.updatedAt, 'en_US')}`;
    return `\n📌 <${pr.url}|${pr.title}> | ${dateString}`;
}
function formatPullRequestAuthor(login) {
    return `\n👤 <https://github.com/${login}|${login}>: `;
}
function formatPullRequests(groupedPullRequests) {
    return Object.keys(groupedPullRequests).map((author) => {
        const text = formatPullRequestAuthor(author).concat(groupedPullRequests[author].map(formatPullRequest).join(''));
        return {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text
            }
        };
    });
}
exports.formatPullRequests = formatPullRequests;
function formatSlackMessage(repoName, blocks, totalPRs, readyPRs) {
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
    };
}
exports.formatSlackMessage = formatSlackMessage;
