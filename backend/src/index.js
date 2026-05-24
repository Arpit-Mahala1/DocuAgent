import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes, { sessions, resolveSession } from "./routes/auth.js";
import docsRoutes, { connectedRepos } from "./routes/docs.js";
import healthRoutes from "./routes/health.js";
import webhookRoutes from "./routes/webhook.js";
import { GitHubService } from "./services/github.js";
import { generateDocs } from "./agents/docAgent.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/api/docs", docsRoutes);
app.use("/webhook", webhookRoutes);

const parseCookies = (req) => {
  const rc = req.headers.cookie || '';
  return rc.split(';').filter(Boolean).reduce((acc, c) => {
    const [k, v] = c.split('=');
    if (!k) return acc;
    acc[k.trim()] = decodeURIComponent((v || '').trim());
    return acc;
  }, {});
};

const getSessionToken = (req) => {
  // Check Authorization header first
  const headerToken = req.headers.authorization?.replace('Bearer ', '');
  if (headerToken) return headerToken;

  // Check cookie set by /auth/github/callback
  try {
    const cookies = parseCookies(req);
    if (cookies.docuagent_token) return cookies.docuagent_token;
  } catch (e) {}

  // Fallback to query param
  return req.query.token || null;
};

const getSession = async (req) => {
  const token = getSessionToken(req);
  if (!token) {
    return null;
  }

  if (sessions.has(token)) {
    return sessions.get(token);
  }

  return await resolveSession(token);
};

app.get("/api/user", async (req, res) => {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ success: false, error: "Invalid or expired session token." });
  }
  return res.json({
    success: true,
    user: {
      login: session.username,
      avatar_url: session.avatar_url
    }
  });
});

app.get("/api/repos", async (req, res) => {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ success: false, error: "Invalid or expired session token." });
  }

  const repos = (session.repos || []).map((repo) => {
    const repoKey = `${repo.owner}/${repo.name}`.toLowerCase();
    return {
      ...repo,
      connected: connectedRepos.includes(repoKey),
      lastDocUpdate: repo.updated_at || null,
      status: connectedRepos.includes(repoKey) ? "Connected" : "Not Connected"
    };
  });

  return res.json({ success: true, repos });
});

app.get("/api/repo/:owner/:repo/tree", async (req, res, next) => {
  const session = await getSession(req);
  const token = getSessionToken(req) || process.env.GITHUB_ACCESS_TOKEN;
  if (!session && !token) {
    return res.status(401).json({ success: false, error: "Invalid or expired session token." });
  }

  const { owner, repo } = req.params;

  try {
    const github = new GitHubService(token);
    const files = await github.listRepoFiles(owner, repo);
    return res.json({ success: true, files });
  } catch (error) {
    next(error);
  }
});

app.get("/api/docs/:owner/:repo", async (req, res, next) => {
  const session = await getSession(req);
  const token = getSessionToken(req) || process.env.GITHUB_ACCESS_TOKEN;
  if (!session && !token) {
    return res.status(401).json({ success: false, error: "Invalid or expired session token." });
  }

  const { owner, repo } = req.params;
  try {
    const github = new GitHubService(token);
    const fileEntries = await github.listRepoFiles(owner, repo);
    
    // Collect .md files from both docs/ folder and repo root
    const docsFiles = fileEntries
      .filter((item) => {
        const isDocsFolderMd = item.path.toLowerCase().startsWith("docs/") && item.path.toLowerCase().endsWith(".md");
        const isRootMd = !item.path.includes("/") && item.path.toLowerCase().endsWith(".md");
        return isDocsFolderMd || isRootMd;
      })
      .map((item) => item.path);

    return res.json({ success: true, files: docsFiles });
  } catch (error) {
    next(error);
  }
});

app.get("/api/docs/:owner/:repo/*", async (req, res, next) => {
  const session = await getSession(req);
  const token = getSessionToken(req) || process.env.GITHUB_ACCESS_TOKEN;
  if (!session && !token) {
    return res.status(401).json({ success: false, error: "Invalid or expired session token." });
  }

  const { owner, repo } = req.params;
  const filepath = req.params[0];
  if (!filepath) {
    return res.status(400).json({ success: false, error: "File path is required." });
  }

  try {
    const github = new GitHubService(token);
    
    // First try docs/{filename}
    try {
      const docsPath = `docs/${filepath}`;
      const fileContent = await github.getFileContent(owner, repo, docsPath);
      return res.json({ success: true, content: fileContent.content });
    } catch (docsErr) {
      // If not found in docs/, try root directory
      try {
        const fileContent = await github.getFileContent(owner, repo, filepath);
        return res.json({ success: true, content: fileContent.content });
      } catch (rootErr) {
        // File not found in either location
        throw rootErr;
      }
    }
  } catch (error) {
    next(error);
  }
});

app.get("/api/agent-logs", (_req, res) => {
  res.json({ logs: [] });
});

app.post("/api/generate", async (req, res, next) => {
  const { repoUrl, owner, repo, branch, accessToken } = req.body;
  if (!repoUrl && (!owner || !repo)) {
    return res.status(400).json({ success: false, error: "Missing repository information. Please provide either 'repoUrl' or both 'owner' and 'repo'." });
  }

  let repoOwner = owner;
  let repoName = repo;
  if (repoUrl && !owner && !repo) {
    try {
      const urlParts = repoUrl.replace("https://github.com/", "").split("/");
      repoOwner = urlParts[0];
      repoName = urlParts[1].replace(".git", "");
    } catch (e) {
      return res.status(400).json({ success: false, error: "Invalid GitHub repository URL format." });
    }
  }

  const actualBranch = branch || "main";
  const githubToken = accessToken || getSessionToken(req) || process.env.GITHUB_ACCESS_TOKEN;

  if (!githubToken) {
    return res.status(401).json({ success: false, error: "Missing GitHub access token." });
  }

  try {
    res.status(202).json({
      success: true,
      message: `Documentation generation agent started for ${repoOwner}/${repoName} on branch ${actualBranch}.`
    });

    generateDocs({
      owner: repoOwner,
      repo: repoName,
      branch: actualBranch,
      token: githubToken
    }).catch((err) => {
      console.error(`[DocuAgent Task Error] Failed for ${repoOwner}/${repoName}:`, err);
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/connect-repo", (req, res) => {
  const { owner, repo } = req.body;
  if (!owner || !repo) {
    return res.status(400).json({ success: false, error: "Missing repository owner or name." });
  }
  const repoKey = `${owner}/${repo}`.toLowerCase();
  if (!connectedRepos.includes(repoKey)) {
    connectedRepos.push(repoKey);
  }
  res.status(200).json({
    success: true,
    message: `Repository ${owner}/${repo} is now connected and being watched.`,
    connectedRepos
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[DocuAgent Error]", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 DocuAgent backend running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please stop the process using this port or set a different PORT in your .env file.`);
    process.exit(1);
  }
  console.error("Unexpected server error:", error);
  process.exit(1);
});

export default app;
