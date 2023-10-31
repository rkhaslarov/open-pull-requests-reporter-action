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
exports.formatSlackMessage = exports.formatSinglePR = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("./api"));
const date_fns_1 = require("date-fns");
const timeago_js_1 = require("timeago.js");
function getReviewStatus(pr) {
    if (pr.reviews.totalCount === 0) {
        return '*No reviews*';
    }
    else if (pr.reviews.nodes.some(review => review.state === github.ReviewStates.CHANGES_REQUESTED)) {
        return '*Changes Requested*';
    }
    else {
        return `*${pr.reviews.totalCount} approvals*`;
    }
}
function formatSinglePR(pr) {
    const stalePrDays = (Number(core.getInput('stale-pr')) ?? 7) * -1;
    const createdAt = new Date(pr.createdAt);
    const status = getReviewStatus(pr);
    const isStalePR = (0, date_fns_1.differenceInCalendarDays)(createdAt, Date.now()) <= stalePrDays;
    const dateString = isStalePR
        ? `🚨 ${(0, timeago_js_1.format)(pr.createdAt, 'en_US')} 🚨`
        : `${(0, timeago_js_1.format)(pr.createdAt, 'en_US')}`;
    return `\n👉 <${pr.url}|${pr.title}> | ${status} | ${dateString}`;
}
exports.formatSinglePR = formatSinglePR;
function formatSlackMessage(repoName, text, totalPRs, readyPRs) {
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
    };
}
exports.formatSlackMessage = formatSlackMessage;
