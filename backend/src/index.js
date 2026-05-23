import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import docsRoutes, { connectedRepos } from "./routes/docs.js";
import healthRoutes from "./routes/health.js";
import webhookRoutes from "./routes/webhook.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

app.listen(PORT, () => {
  console.log(`🚀 DocuAgent backend running on http://localhost:${PORT}`);
});

export default app;
