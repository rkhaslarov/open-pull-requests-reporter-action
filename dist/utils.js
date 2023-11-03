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
exports.groupPullRequestsByAuthor = exports.isPullRequestReadyForReview = exports.getPullRequestStatus = exports.PRStatuses = void 0;
const github = __importStar(require("./api"));
exports.PRStatuses = {
    REVIEWED: 'REVIEWED',
    CHANGES_REQUIRED: 'CHANGES_REQUIRED',
    REVIEW_REQUIRED: 'REVIEW_REQUIRED',
    DRAFT: 'DRAFT'
};
function getPullRequestStatus(pr) {
    if (pr.isDraft) {
        return exports.PRStatuses.DRAFT;
    }
    if (pr.reviews.totalCount >= 2) {
        return exports.PRStatuses.REVIEWED;
    }
    if (pr.reviews.nodes.some(review => review.state === github.ReviewStates.CHANGES_REQUESTED)) {
        return exports.PRStatuses.CHANGES_REQUIRED;
    }
    return exports.PRStatuses.REVIEW_REQUIRED;
}
exports.getPullRequestStatus = getPullRequestStatus;
function isPullRequestReadyForReview(pr, excludeLabels) {
    const status = getPullRequestStatus(pr);
    const excludedByLabels = pr.labels.nodes.some(label => excludeLabels.includes(label.name));
    return status === exports.PRStatuses.REVIEW_REQUIRED && !excludedByLabels;
}
exports.isPullRequestReadyForReview = isPullRequestReadyForReview;
function groupPullRequestsByAuthor(prs) {
    return prs.reduce((acc, cur) => {
        if (acc[cur.author.login]) {
            acc[cur.author.login].push(cur);
        }
        else {
            acc[cur.author.login] = [];
        }
        return acc;
    }, {});
}
exports.groupPullRequestsByAuthor = groupPullRequestsByAuthor;
