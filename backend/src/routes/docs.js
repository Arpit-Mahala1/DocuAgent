import express from "express";
import path from "path";
import { generateDocs } from "../agents/docAgent.js";
import { runCodeParserAgent } from "../agents/codeParserAgent.js";
import { runAgent } from "../agents/orchestrator.js";
import { resolveSession, getSessionToken } from "./auth.js";
import { connectedRepos } from "./connectedRepos.js";

const router = express.Router();

/**
 * POST /api/docs/generate
 * Triggers the documentation generation agent for a given repo
 */
router.post("/generate", async (req, res, next) => {
  const { repoUrl, owner, repo, branch, accessToken } = req.body;

  if (!repoUrl && (!owner || !repo)) {
    return res.status(400).json({
      success: false,
      error: "Missing repository information. Please provide either 'repoUrl' or both 'owner' and 'repo'."
    });
  }

  // Parse repoUrl if provided (e.g. https://github.com/owner/repo)
  let repoOwner = owner;
  let repoName = repo;
  if (repoUrl && !owner && !repo) {
    try {
      const urlParts = repoUrl.replace("https://github.com/", "").split("/");
      repoOwner = urlParts[0];
      repoName = urlParts[1].replace(".git", "");
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: "Invalid GitHub repository URL format."
      });
    }
  }

  const activeBranch = branch || "main";
  const githubToken = accessToken || process.env.GITHUB_ACCESS_TOKEN;

  try {
    res.status(202).json({
      success: true,
      message: `Documentation generation agent started for ${repoOwner}/${repoName} on branch ${activeBranch}.`
    });

    // Run agent asynchronously so we don't block the request response
    // (In production, use a task queue like BullMQ or a Webhook/Server-Sent Events)
    generateDocs({
      owner: repoOwner,
      repo: repoName,
      branch: activeBranch,
      token: githubToken
    }).catch((err) => {
      console.error(`[DocuAgent Task Error] Failed for ${repoOwner}/${repoName}:`, err);
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/docs/parse
 * Runs CodeParserAgent on the specified local directory path or remote GitHub repository
 */
router.post("/parse", async (req, res, next) => {
  const { folderPath, owner, repo, branch, accessToken } = req.body;

  try {
    let runOptions;

    if (owner && repo) {
      const token = accessToken || getSessionToken(req);
      if (!token && !process.env.GITHUB_ACCESS_TOKEN) {
        return res.status(401).json({ success: false, error: "Missing GitHub access token." });
      }

      if (!accessToken && token) {
        const session = await resolveSession(token);
        if (!session) {
          return res.status(401).json({ success: false, error: "Invalid or expired session token." });
        }
      }

      runOptions = {
        owner,
        repo,
        branch: branch || "main",
        token: accessToken || token || process.env.GITHUB_ACCESS_TOKEN
      };
    } else {
      // Resolve path relative to current backend workspace to guarantee robust file operations
      const targetFolder = folderPath || ".";
      const resolvedPath = path.resolve(targetFolder);
      runOptions = { folderPath: resolvedPath };
    }

    // Print streaming console outputs to server console
    const result = await runCodeParserAgent(runOptions, (event) => {
      if (event.type === "status") {
        console.log(`[CodeParserAgent Status] ${event.message}`);
      } else if (event.type === "stream") {
        process.stdout.write(event.text);
      }
    });

    res.status(200).json({
      success: true,
      message: `CodeParserAgent successfully parsed files.`,
      result
    });
  } catch (error) {
    next(error);
  }
});

router.post("/api-reference", async (req, res, next) => {
  const { owner, repo, token, branch } = req.body;
  if (!owner || !repo) {
    return res.status(400).json({ success: false, error: "Missing owner or repo." });
  }
  const githubToken = token || process.env.GITHUB_ACCESS_TOKEN;
  if (!githubToken) {
    return res.status(401).json({ success: false, error: "Missing GitHub access token." });
  }
  try {
    res.status(202).json({
      success: true,
      message: `API documentation generation started for ${owner}/${repo}.`
    });

    runAgent({ trigger: "api-docs", owner, repo, token: githubToken, branch: branch || "main" }).catch((err) => {
      console.error(`[DocsRoute] APIDocAgent failed for ${owner}/${repo}:`, err);
    });
  } catch (error) {
    next(error);
  }
});

router.post("/pr-summary", async (req, res, next) => {
  const { owner, repo, prNumber, token } = req.body;
  if (!owner || !repo || !prNumber) {
    return res.status(400).json({ success: false, error: "Missing owner, repo, or prNumber." });
  }
  const githubToken = token || process.env.GITHUB_ACCESS_TOKEN;
  if (!githubToken) {
    return res.status(401).json({ success: false, error: "Missing GitHub access token." });
  }
  try {
    res.status(202).json({
      success: true,
      message: `PR summarization started for ${owner}/${repo} PR #${prNumber}.`
    });

    runAgent({ trigger: "pr-summary", owner, repo, token: githubToken, prNumber }).catch((err) => {
      console.error(`[DocsRoute] PRSummarizerAgent failed for ${owner}/${repo} PR #${prNumber}:`, err);
    });
  } catch (error) {
    next(error);
  }
});

router.post("/changelog", async (req, res, next) => {
  const { owner, repo, token, branch } = req.body;
  if (!owner || !repo) {
    return res.status(400).json({ success: false, error: "Missing owner or repo." });
  }
  const githubToken = token || process.env.GITHUB_ACCESS_TOKEN;
  if (!githubToken) {
    return res.status(401).json({ success: false, error: "Missing GitHub access token." });
  }
  try {
    res.status(202).json({
      success: true,
      message: `Changelog update started for ${owner}/${repo}.`
    });

    runAgent({ trigger: "deployment", owner, repo, token: githubToken, branch: branch || "main" }).catch((err) => {
      console.error(`[DocsRoute] DeploymentChangeAgent failed for ${owner}/${repo}:`, err);
    });
  } catch (error) {
    next(error);
  }
});

export default router;

