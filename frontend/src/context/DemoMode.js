/**
 * Demo Mode Sample Data
 * Pre-generated documentation samples for judges to explore without authentication
 */

export const DEMO_OWNER = 'your-username';
export const DEMO_REPO = 'DocuAgent';

export const DEMO_DOCS_LIST = [
  'README.md',
  'docs/API_REFERENCE.md',
  'docs/ARCHITECTURE.md',
  'docs/DEPLOYMENT.md',
];

export const DEMO_REPO_FILES = [
  'package.json',
  'README.md',
  'Dockerfile',
  '.gitignore',
  'backend/',
  'backend/index.js',
  'backend/package.json',
  'backend/src/',
  'backend/src/index.js',
  'backend/src/agents/',
  'backend/src/agents/orchestrator.js',
  'backend/src/agents/docAgent.js',
  'backend/src/agents/apiDocAgent.js',
  'backend/src/routes/',
  'backend/src/routes/auth.js',
  'backend/src/routes/docs.js',
  'backend/src/services/',
  'backend/src/services/github.js',
  'frontend/',
  'frontend/package.json',
  'frontend/vite.config.js',
  'frontend/tailwind.config.js',
  'frontend/src/',
  'frontend/src/App.jsx',
  'frontend/src/main.jsx',
  'frontend/src/pages/',
  'frontend/src/pages/Landing.jsx',
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/DocsViewer.jsx',
  'frontend/src/components/',
  'frontend/src/components/Logo.jsx',
  'frontend/src/components/RepoCard.jsx',
  'frontend/src/context/',
  'frontend/src/context/AuthContext.jsx',
];

export const DEMO_DOCS_CONTENT = {
  'README.md': `# DocuAgent — AI-Powered Documentation

**Automatic technical documentation generation for GitHub repositories.**

DocuAgent is an agentic AI assistant that automatically generates, updates, and manages high-quality technical documentation. Connect your GitHub repo once, and documentation updates automatically on every commit.

## Key Features

- 🤖 AI-powered documentation generation using Groq Llama 3.3
- 🔄 Automatic updates on GitHub webhooks (push, PR)
- 📑 Five specialized agents: API Reference, Architecture, Deployment, PR Summary, Changelog
- 🌐 GitHub OAuth integration (no API keys exposed)
- ✅ Supports JavaScript, TypeScript, Python
- 📱 Fully responsive dark theme UI
- 🎪 Demo mode (no login required)
- 🚀 Docker-ready for production

## Quick Start

\`\`\`bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in GROQ_API_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
\`\`\`

## Tech Stack

- **Backend:** Node.js, Express, Groq LLM
- **Frontend:** React, Vite, Tailwind CSS
- **Integration:** GitHub API, Octokit
- **Styling:** Tailwind CSS 4 with teal accent (#14b8a6)

## How It Works

1. Connect a GitHub repository via OAuth
2. DocuAgent analyzes your codebase
3. AI generates professional documentation
4. Docs auto-update on new commits/PRs
5. Browse generated docs in the DocsViewer

Visit the dashboard to connect your first repo and start generating docs!
`,

  'docs/API_REFERENCE.md': `# API Reference

## Backend Endpoints

### Authentication

#### \`GET /auth/github\`
Initiates GitHub OAuth flow.

**Response:** Redirects to GitHub authorization page

---

#### \`GET /auth/github/callback\`
GitHub OAuth callback handler.

**Query Parameters:**
- \`code\` (string) — Authorization code from GitHub

**Response:**
\`\`\`json
{
  "redirectUrl": "http://localhost:5173?token=<JWT_TOKEN>"
}
\`\`\`

---

#### \`GET /auth/session\`
Validates current session and retrieves user data.

**Headers:**
- \`Authorization: Bearer <TOKEN>\` (optional)

**Response:**
\`\`\`json
{
  "success": true,
  "username": "github-username",
  "avatar_url": "https://avatars.githubusercontent.com/...",
  "repos": [
    {
      "id": 123,
      "name": "repo-name",
      "owner": "owner-name",
      "url": "https://github.com/..."
    }
  ]
}
\`\`\`

---

### Repositories

#### \`GET /api/repos\`
Lists all user repositories with connection status.

**Response:**
\`\`\`json
{
  "success": true,
  "repos": [
    {
      "id": 123,
      "name": "my-project",
      "owner": "my-org",
      "connected": true,
      "status": "Connected",
      "lastDocUpdate": "2026-05-24T10:30:00Z"
    }
  ]
}
\`\`\`

---

#### \`POST /api/connect-repo\`
Connects a repository for documentation generation.

**Body:**
\`\`\`json
{
  "owner": "my-org",
  "repo": "my-repo"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Repository connected successfully"
}
\`\`\`

---

### Documentation

#### \`GET /api/docs/:owner/:repo\`
Lists all generated documentation files for a repo.

**Response:**
\`\`\`json
{
  "success": true,
  "files": ["README.md", "docs/API_REFERENCE.md", "docs/ARCHITECTURE.md"]
}
\`\`\`

---

#### \`GET /api/docs/:owner/:repo/:filepath\`
Retrieves content of a specific documentation file.

**Response:**
\`\`\`json
{
  "success": true,
  "content": "# API Reference\\n\\n..."
}
\`\`\`

---

#### \`POST /api/generate\`
Triggers documentation regeneration for a repository.

**Body:**
\`\`\`json
{
  "owner": "my-org",
  "repo": "my-repo"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Documentation generation started"
}
\`\`\`

---

### Utilities

#### \`GET /health\`
Health check endpoint.

**Response:**
\`\`\`json
{
  "status": "ok",
  "uptime": 3600,
  "version": "1.0.0"
}
\`\`\`

---

#### \`GET /api/agent-logs\`
Retrieves recent agent activity logs (polls every 3s in frontend).

**Response:**
\`\`\`json
{
  "logs": [
    {
      "timestamp": "2026-05-24T10:30:00Z",
      "agent": "docAgent",
      "action": "Generating API documentation",
      "status": "in_progress"
    }
  ]
}
\`\`\`

---

## Frontend Context API

### AuthContext

Manages authentication state and GitHub session.

**Properties:**
- \`user\` — Current logged-in user object
- \`token\` — Session JWT token
- \`authenticated\` — Boolean auth status
- \`repos\` — User's GitHub repositories

**Methods:**
- \`login()\` — Initiates GitHub OAuth flow
- \`logout()\` — Clears session
- \`fetchSession(token)\` — Validates token and fetches user data

---

## Error Handling

All endpoints return error responses in standard format:

\`\`\`json
{
  "success": false,
  "error": "Descriptive error message"
}
\`\`\`

**Common HTTP Status Codes:**
- \`200\` — Success
- \`400\` — Bad request (validation error)
- \`401\` — Unauthorized (invalid or expired token)
- \`500\` — Server error

---
`,

  'docs/ARCHITECTURE.md': `# Architecture Guide

## Project Structure

DocuAgent follows a clean separation between frontend and backend:

\`\`\`
docuagent/
├── backend/          # Express.js + AI agents
│   ├── src/
│   │   ├── agents/         # AI agent implementations
│   │   ├── routes/         # Express route handlers
│   │   ├── services/       # GitHub API integration
│   │   └── index.js        # Server setup & middleware
│   ├── index.js            # Entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/         # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/          # Route components
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── api/            # API client
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
\`\`\`

## Backend Architecture

### Request Flow

1. **User connects GitHub** → OAuth redirect
2. **Backend validates** → /auth/github/callback
3. **JWT issued** → Stored in localStorage
4. **API calls** include JWT token in Authorization header
5. **Backend authenticates** → Routes process request

### Agent System

Each documentation type is handled by a specialized agent:

**docAgent.js**
- Generates general documentation
- Analyzes project structure
- Creates comprehensive README updates

**apiDocAgent.js**
- Extracts function signatures
- Documents parameters and return types
- Generates API reference tables

**deploymentAgent.js**
- Creates deployment guides
- Documents environment variables
- Provides setup instructions

**prSummarizerAgent.js**
- Summarizes pull request changes
- Extracts feature additions
- Identifies breaking changes

**codeParserAgent.js**
- Analyzes code structure
- Identifies design patterns
- Maps module relationships

### Orchestrator

The orchestrator routes requests to appropriate agents:

\`\`\`javascript
// Pseudo-code
async function generateDocumentation(owner, repo, type) {
  switch(type) {
    case 'api': return apiDocAgent.generate(owner, repo);
    case 'deployment': return deploymentAgent.generate(owner, repo);
    case 'pr-summary': return prSummarizerAgent.generate(owner, repo);
    default: return docAgent.generate(owner, repo);
  }
}
\`\`\`

## Frontend Architecture

### Page Flow

**Landing.jsx** → Try Demo or Connect GitHub
↓
**Dashboard.jsx** → List repos, manage connections
↓
**DocsViewer.jsx** → Browse & regenerate docs

### State Management

- **AuthContext** — Global auth state (user, token, repos)
- **Local useState** — Page-specific state (loading, selected file, etc.)
- **localStorage** — Persists JWT token

### Component Hierarchy

\`\`\`
App.jsx (routing)
├── Landing.jsx
│   └── RepoCard (feature cards)
├── Dashboard.jsx
│   ├── RepoCard (connected repos)
│   └── RepoSelector (available repos)
└── DocsViewer.jsx
    ├── DocsSidebar (file tree)
    ├── MarkdownViewer (content display)
    └── ActivityFeed (agent logs)
\`\`\`

## Styling System

Using Tailwind CSS v4 with CSS variables:

\`\`\`css
--color-bg: #0a0a0a           /* Main background */
--color-surface: #111111       /* Card surface */
--color-primary: #14b8a6       /* Teal accent */
--color-text-primary: #fafafa  /* Main text */
--color-text-muted: #888888    /* Secondary text */
--color-border: #222222        /* Borders */
\`\`\`

## Data Flow

### Demo Mode

Demo data is served from browser localStorage without backend calls:

1. Click "Try Demo" → Load demo context
2. Set owner/repo to hardcoded demo values
3. Fetch pre-generated docs from embedded data
4. Display in DocsViewer with full UI

### Authenticated Mode

1. User connects GitHub → Gets OAuth token
2. Token stored in localStorage
3. All API calls include token in Authorization header
4. Backend validates token → Routes to appropriate handler
5. Response cached locally when appropriate

## Security Considerations

- JWT tokens stored in localStorage (not cookies, to avoid CSRF)
- CORS configured to allow only frontend origin
- No API keys exposed to frontend
- Environment variables kept in .env (not committed)
- GitHub OAuth replaces direct token handling

---
`,

  'docs/DEPLOYMENT.md': `# Deployment Guide

## Production Setup

### Backend Deployment

#### Docker (Recommended)

\`\`\`bash
# Build image
cd backend
docker build -t docuagent-backend:latest .

# Run container
docker run \\
  -p 3001:3001 \\
  -e PORT=3001 \\
  -e GROQ_API_KEY=sk-xxx \\
  -e GITHUB_CLIENT_ID=xxx \\
  -e GITHUB_CLIENT_SECRET=xxx \\
  -e FRONTEND_URL=https://yourdomain.com \\
  docuagent-backend:latest
\`\`\`

#### Railway / Heroku / Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy (auto-triggers on push)

**Required Environment Variables:**
- \`GROQ_API_KEY\` — Groq API key
- \`GITHUB_CLIENT_ID\` — GitHub OAuth Client ID
- \`GITHUB_CLIENT_SECRET\` — GitHub OAuth Client Secret
- \`FRONTEND_URL\` — Frontend URL (for CORS)
- \`PORT\` — Server port (default: 3001)

### Frontend Deployment

#### Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel
\`\`\`

#### Netlify

1. Connect GitHub repository
2. Build command: \`npm run build\`
3. Publish directory: \`dist\`
4. Deploy

#### GitHub Pages

\`\`\`bash
cd frontend
npm run build
# Push dist/ to gh-pages branch
\`\`\`

## Environment Configuration

### Production .env

\`\`\`env
# Server
PORT=3001
NODE_ENV=production

# Frontend
FRONTEND_URL=https://yourdomain.com

# Groq API
GROQ_API_KEY=sk-your-key-here

# GitHub OAuth
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_CALLBACK_URL=https://api.yourdomain.com/auth/github/callback

# Optional
GITHUB_ACCESS_TOKEN=ghp_your-pat-token
\`\`\`

## Health Checks

Monitor backend health:

\`\`\`bash
curl https://yourdomain.com/health

# Response:
# {
#   "status": "ok",
#   "uptime": 3600,
#   "version": "1.0.0"
# }
\`\`\`

## Monitoring

### Logs

- **Backend:** Check console/Docker logs for agent activity
- **Frontend:** Browser DevTools console for client errors

### Error Tracking

Implement Sentry or similar:

\`\`\`javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://...",
  environment: "production"
});
\`\`\`

## Performance Optimization

### Backend

- Use npm ci instead of npm install in Docker
- Enable gzip compression: \`app.use(compression())\`
- Cache GitHub API responses when possible
- Use connection pooling for databases

### Frontend

- Build optimization: \`npm run build\`
- CDN for static assets (Vercel/Netlify does this)
- Code splitting with React lazy loading
- Image optimization

## Scaling Considerations

- **Stateless backend** — Can run multiple instances
- **Session storage** — Use Redis for distributed sessions
- **Rate limiting** — Implement per-user API limits
- **Queue system** — Use Bull/RabbitMQ for agent tasks

---
`,
};

/**
 * Hook to use demo mode
 */
export const useDemoMode = () => {
  return {
    isDemoMode: true,
    owner: DEMO_OWNER,
    repo: DEMO_REPO,
    files: DEMO_DOCS_LIST,
    repoFiles: DEMO_REPO_FILES,
    getDocContent: (filename) => DEMO_DOCS_CONTENT[filename] || '',
  };
};
