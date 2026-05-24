import express from "express";
import axios from "axios";
import { GitHubService } from "../services/github.js";
import { connectedRepos } from "./docs.js";

const router = express.Router();

// In-memory session store: accessToken -> { username, avatar_url, repos }
export const sessions = new Map();

export async function resolveSession(token) {
  if (!token) return null;
  if (sessions.has(token)) {
    return sessions.get(token);
  }

  try {
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "DocuAgent-App"
      }
    });

    const { login: username, avatar_url } = userResponse.data;
    const githubService = new GitHubService(token);
    const repos = await githubService.listUserRepos();

    const sessionData = {
      username,
      avatar_url,
      repos
    };

    sessions.set(token, sessionData);
    return sessionData;
  } catch (error) {
    try {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error(`[Auth] Failed to restore session from token: status=${status} message=${error.message} data=${JSON.stringify(data)}`);
    } catch (e) {
      console.error('[Auth] Failed to restore session from token:', error.message);
    }
    return null;
  }
}

const parseCookies = (req) => {
  const rc = req.headers.cookie || '';
  return rc.split(';').filter(Boolean).reduce((acc, c) => {
    const [k, v] = c.split('=');
    if (!k) return acc;
    acc[k.trim()] = decodeURIComponent((v || '').trim());
    return acc;
  }, {});
};

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
        Authorization: `Bearer ${accessToken}`,
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

    try {
      const preview = accessToken ? `${accessToken.slice(0,6)}...(${accessToken.length})` : 'none';
      console.log(`[Auth] /github/callback stored session for token ${preview}`);
    } catch (e) {
      // ignore
    }
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

    // Redirect to frontend with token in URL so cross-origin local dev works.
    // (Cookie set on :3001 is not readable by frontend on :3000/:5173)
    const frontendUrl = process.env.FRONTEND_URL;

    try {
      res.cookie('docuagent_token', accessToken, {
        httpOnly: false, // readable by JS for same-origin production deployments
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    } catch (e) {}

    // Always pass token in URL — only reliable method for cross-origin local dev
    res.redirect(`${frontendUrl}/?token=${accessToken}`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/session
 * Returns stored user details and repos for an active session token
 */
router.get("/session", async (req, res) => {
  const headerToken = req.headers.authorization?.replace("Bearer ", "");
  const cookies = parseCookies(req);
  const cookieToken = cookies.docuagent_token;
  const token = headerToken || cookieToken || req.query.token;
  try {
    const tokenPreview = token ? `${token.slice(0, 6)}...(${token.length})` : 'none';
    const presentInStore = token ? sessions.has(token) : false;
    console.log(`[Auth] /session called - token: ${tokenPreview}, inStore: ${presentInStore}`);
  } catch (e) {
    // ignore logging errors
  }
  const sessionData = await resolveSession(token);

  if (!sessionData) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired session token."
    });
  }

  // Decorate repos with connected status (same as /api/repos in index.js)
  const decoratedRepos = (sessionData.repos || []).map((repo) => {
    const repoKey = `${repo.owner}/${repo.name}`.toLowerCase();
    const isConnected = connectedRepos.includes(repoKey);
    return {
      ...repo,
      connected: isConnected,
      lastDocUpdate: repo.updated_at || null,
      status: isConnected ? "Connected" : "Not Connected",
    };
  });

  res.json({
    success: true,
    token, // return token so frontend can persist it if needed
    ...sessionData,
    repos: decoratedRepos,
  });
});

export default router;
