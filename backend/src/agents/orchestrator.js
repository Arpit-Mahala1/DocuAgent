import { runCodeParserAgent } from "./codeParserAgent.js";
import { runAPIDocAgent } from "./apiDocAgent.js";
import { runPRSummarizerAgent } from "./prSummarizerAgent.js";
import { runDeploymentChangeAgent } from "./deploymentAgent.js";

const agentLogs = [];

function trimLogs() {
  while (agentLogs.length > 50) {
    agentLogs.shift();
  }
}

function createLogEntry(trigger, repo) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const entry = {
    id,
    trigger,
    repo,
    status: "running",
    startTime: new Date().toISOString(),
    endTime: null,
    output: null
  };
  agentLogs.push(entry);
  trimLogs();
  return entry;
}

export function getAgentLogs() {
  return [...agentLogs].reverse();
}

export async function runAgent({ trigger, owner, repo, token, branch = "main", prNumber, files }) {
  const repoKey = owner && repo ? `${owner}/${repo}` : repo || "unknown";
  const logEntry = createLogEntry(trigger, repoKey);

  try {
    let result;

    switch (trigger) {
      case "parse":
        result = await runCodeParserAgent({ owner, repo, token, branch, files });
        break;
      case "api-docs":
        result = await runAPIDocAgent({ owner, repo, token, branch });
        break;
      case "pr-summary":
        result = await runPRSummarizerAgent({ owner, repo, token, prNumber });
        break;
      case "deployment":
        result = await runDeploymentChangeAgent({ owner, repo, token, branch });
        break;
      default:
        throw new Error(`Unknown trigger type: ${trigger}`);
    }

    logEntry.status = "success";
    logEntry.endTime = new Date().toISOString();
    logEntry.output = result;

    return result;
  } catch (error) {
    logEntry.status = "failure";
    logEntry.endTime = new Date().toISOString();
    logEntry.output = {
      error: error.message || String(error)
    };
    console.error(`[AgentOrchestrator] ${trigger} failed for ${repoKey}:`, error);
    throw error;
  }
}
