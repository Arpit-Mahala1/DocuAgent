import express from "express";
import axios from "axios";
import { GitHubService } from "../services/github.js";

const router = express.Router();

// In-memory session store: accessToken -> { username, avatar_url, repos }
export const sessions = new Map();

/**
 * GET /auth/github
 * Redirects the user to GitHub OAuth login page
 */
router.get("/github", (req, res) => {
  const clientID = process.env.GITHUB_CLIENT_ID;
  const redirectURI = process.env.GITHUB_CALLBACK_URL;
  const scope = "repo,user,read:org";

  if (!clientID) {
    return res.status(500).json({
      success: false,
      error: "GITHUB_CLIENT_ID is not configured in environment variables."
    });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(
    redirectURI
  )}&scope=${encodeURIComponent(scope)}&state=docuagent-state-handshake`;

  res.redirect(githubAuthUrl);
});

/**
 * GET /auth/github/callback
 * Handles authorization code exchange for an access token
 */
router.get("/github/callback", async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "Authorization code is missing from GitHub redirect."
    });
  }

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL
      },
      {
        headers: {
          Accept: "application/json"
        }
      }
    );

    const data = response.data;

    if (data.error) {
      return res.status(400).json({
        success: false,
        error: data.error_description || data.error
      });
    }

    const accessToken = data.access_token;

    // Fetch user details from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "DocuAgent-App"
      }
    });

    const { login: username, avatar_url } = userResponse.data;

    // Fetch user's repos using our GitHub service
    const githubService = new GitHubService(accessToken);
    const repos = await githubService.listUserRepos();

    // Store in-memory session
    sessions.set(accessToken, {
      username,
      avatar_url,
      repos
    });

    // Check if client expects JSON (for programmatic tests)
    const wantsJson = req.query.json === "true" || (req.headers.accept && req.headers.accept.includes("application/json"));

    if (wantsJson) {
      return res.json({
        success: true,
        accessToken,
        username,
        avatar_url,
        repos
      });
    }

    // Default: Redirect to frontend dashboard passing the token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}?token=${accessToken}`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/session
 * Returns stored user details and repos for an active session token
 */
router.get("/session", (req, res) => {
  const token = req.query.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token || !sessions.has(token)) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired session token."
    });
  }

  const sessionData = sessions.get(token);
  res.json({
    success: true,
    ...sessionData
  });
});

export default router;
