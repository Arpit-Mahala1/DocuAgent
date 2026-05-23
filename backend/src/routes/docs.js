import express from "express";
import { generateDocs } from "../agents/docAgent.js";

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

export default router;
