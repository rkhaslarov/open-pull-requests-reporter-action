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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
const github = __importStar(require("./api"));
const message_1 = require("./message");
async function run() {
    try {
        const token = core.getInput('repo-token');
        const slackWebhook = core.getInput('slack-webhook');
        const notifyEmpty = core.getInput('notify-empty') === 'true';
        const excludeLabels = core.getInput('exclude-labels')?.split(',');
        core.info(`Starting GraphQL request...`);
        const response = await github.queryPRs(token);
        core.info(`Successful GraphQL response: ${JSON.stringify(response)}`);
        const pullRequests = response?.pullRequests.nodes;
        const repoName = response?.nameWithOwner;
        const readyPRS = pullRequests.filter((pr) => {
            const excluded = excludeLabels &&
                pr.labels.nodes.some(label => excludeLabels.includes(label.name));
            return !pr.isDraft && !excluded;
        });
        core.info(`PRs are ready for review: ${JSON.stringify(readyPRS)}`);
        let text = '';
        if (readyPRS.length === 0) {
            if (notifyEmpty) {
                text = '👍 No PRs are waiting for review!';
            }
            else {
                return;
            }
        }
        for (const pr of readyPRS) {
            text = text.concat((0, message_1.formatSinglePR)(pr));
        }
        const message = (0, message_1.formatSlackMessage)(repoName, text, pullRequests.length, readyPRS.length);
        await axios_1.default.post(slackWebhook, message);
        core.info('Successful Slack webhook response');
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
exports.run = run;
