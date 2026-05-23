import express from "express";
import crypto from "crypto";
import { Octokit } from "octokit";
import { runCodeParserAgent } from "../agents/codeParserAgent.js";
import { sessions } from "./auth.js";
import { connectedRepos } from "./docs.js";

const router = express.Router();

function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    console.warn("[Webhook] GITHUB_WEBHOOK_SECRET is not configured in backend env.");
    return false;
  }

  if (!signature) {
    console.warn("[Webhook] Missing x-hub-signature-256 header.");
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(req.rawBody || "");
  const digest = "sha256=" + hmac.digest("hex");

  const checksum = Buffer.from(signature, "utf8");
  const expected = Buffer.from(digest, "utf8");

  return checksum.length === expected.length && crypto.timingSafeEqual(checksum, expected);
}

function getAccessTokenForRepo(owner, repo) {
  const fullRepoName = `${owner}/${repo}`.toLowerCase();
  for (const [token, sessionData] of sessions.entries()) {
    if (sessionData.repos && sessionData.repos.some(r => r.full_name.toLowerCase() === fullRepoName)) {
      return token;
    }
  }
  return process.env.GITHUB_ACCESS_TOKEN;
}

router.post("/github", async (req, res, next) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ success: false, error: "Invalid webhook signature." });
  }

  const eventType = req.headers["x-github-event"];
  const payload = req.body;

  if (!payload || !payload.repository) {
    return res.status(400).json({ success: false, error: "Invalid webhook payload structure." });
  }

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const repoKey = `${owner}/${repo}`.toLowerCase();

  // 1. Verify if this repo is being watched
  if (!connectedRepos.includes(repoKey)) {
    console.log(`[Webhook] Skipping event for non-connected repository: ${repoKey}`);
    return res.status(200).json({ success: true, message: `Repository ${repoKey} is not connected.` });
  }

  console.log(`[Webhook] Received github event '${eventType}' for watched repo ${repoKey}`);

  let changedFiles = [];
  let branch = "main";

  try {
    const token = getAccessTokenForRepo(owner, repo);
    if (!token) {
      console.warn(`[Webhook] No active GitHub OAuth token found for repository: ${repoKey}`);
      return res.status(200).json({ success: true, message: "No GitHub token found to process events." });
    }

    if (eventType === "pull_request") {
      const { action, pull_request } = payload;
      if (action === "closed" && pull_request.merged === true) {
        branch = pull_request.base.ref || "main";
        console.log(`[Webhook] PR #${payload.number} was closed and merged into ${branch}. Fetching files list...`);

        const octokit = new Octokit({ auth: token });
        const response = await octokit.rest.pulls.listFiles({
          owner,
          repo,
          pull_number: payload.number,
          per_page: 100
        });

        changedFiles = response.data
          .filter(f => f.status !== "removed" && (f.filename.endsWith(".js") || f.filename.endsWith(".ts") || f.filename.endsWith(".py")))
          .map(f => f.filename);
      }
    } else if (eventType === "push") {
      if (payload.ref) {
        branch = payload.ref.replace("refs/heads/", "");
      }

      if (payload.commits) {
        for (const commit of payload.commits) {
          const files = [...(commit.added || []), ...(commit.modified || [])];
          for (const file of files) {
            if (!changedFiles.includes(file) && (file.endsWith(".js") || file.endsWith(".ts") || file.endsWith(".py"))) {
              changedFiles.push(file);
            }
          }
        }
      }
    }

    if (changedFiles.length > 0) {
      console.log(`[Webhook] Found ${changedFiles.length} changed compatible file(s): ${changedFiles.join(", ")}`);

      // Fire-and-forget processing in the background
      runCodeParserAgent({
        owner,
        repo,
        token,
        branch,
        files: changedFiles
      }, (event) => {
        if (event.type === "status") {
          console.log(`[Webhook CodeParserAgent Status] ${event.message}`);
        }
      }).catch(err => {
        console.error(`[Webhook CodeParserAgent Error] Failed to update docs for ${repoKey}:`, err);
      });

      return res.status(202).json({
        success: true,
        message: `Triggered documentation updates for ${changedFiles.length} files.`
      });
    }

    return res.status(200).json({
      success: true,
      message: "No relevant code file changes detected."
    });
  } catch (error) {
    next(error);
  }
});

export default router;
