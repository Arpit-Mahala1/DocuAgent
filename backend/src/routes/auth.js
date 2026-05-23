import express from "express";
import axios from "axios";

const router = express.Router();

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
  const { code, state } = req.query;

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
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Redirect to frontend dashboard passing the token
    // In production, you would typically save this to a session or database,
    // or return a JWT, but for boilerplate we will pass it as a query param or response
    res.redirect(`${frontendUrl}?token=${accessToken}`);
  } catch (error) {
    next(error);
  }
});

export default router;
