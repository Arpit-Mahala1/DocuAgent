# ![DocuAgent](https://img.shields.io/badge/DocuAgent-Teal%20%2314b8a6-teal?style=flat-square&labelColor=%230a0a0a)

**Automatic, AI-powered documentation generation for your GitHub repositories.**

DocuAgent is an agentic AI assistant that automatically generates, updates, and manages high-quality technical documentation for your repositories. Connect your GitHub repo once, and let AI handle the rest — documentation is generated intelligently on every PR merge and webhook trigger.

---

## 🎯 Problem Statement

Maintaining up-to-date technical documentation is a persistent challenge for development teams. Documentation often falls behind code changes, leading to outdated APIs, unclear setup instructions, and poor knowledge transfer. **DocuAgent solves this by automating documentation generation directly from your codebase**, ensuring docs always reflect your latest code.

---

## ✨ Key Features

- **🤖 AI-Powered Generation** — Uses Groq's Llama 3.3 to intelligently analyze code and generate professional documentation
- **🔄 Automatic Updates** — Docs regenerate automatically when you push code via GitHub webhooks
- **📑 Five Specialized Agents** — API Reference, Architecture Guide, Deployment Guide, PR Summaries, Changelog
- **🌐 GitHub OAuth** — Seamless integration; no API keys exposed to users
- **✅ Multi-Language** — JavaScript, TypeScript, and Python projects supported
- **📱 Fully Responsive** — Dark theme dashboard built with Tailwind CSS (mobile-first)
- **🎪 Demo Mode** — Try the full experience without authentication
- **🚀 Production-Ready** — Docker support, comprehensive error handling, teal accent theme

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend Runtime** | Node.js 20 (ES Modules) |
| **Backend Framework** | Express.js |
| **AI/LLM** | Groq SDK with Llama 3.3 |
| **GitHub Integration** | Octokit + GitHub REST API |
| **Frontend Framework** | React 18 |
| **Frontend Tooling** | Vite 5 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Lucide React icons, React Hot Toast |
| **Markdown** | react-markdown + rehype-highlight |

---

## 📋 Setup Instructions

### Prerequisites

- **Node.js 18+** installed
- **GitHub account** with OAuth app credentials
- **Groq API key** (free at [console.groq.com](https://console.groq.com))

### Backend Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/DocuAgent.git
   cd DocuAgent/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   
   # Groq API (free tier at console.groq.com)
   GROQ_API_KEY=your_groq_api_key_here
   
   # GitHub OAuth App (from github.com/settings/developers)
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
   
   # Optional: Demo mode fallback
   GITHUB_ACCESS_TOKEN=your_github_pat_optional
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Backend available at `http://localhost:3001`

### Frontend Setup

1. **Open new terminal:**
   ```bash
   cd DocuAgent/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   Frontend available at `http://localhost:5173`

### GitHub OAuth App Setup

1. Navigate to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** `DocuAgent`
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:3001/auth/github/callback`
4. Copy **Client ID** and **Client Secret** into `.env`
5. Done! The OAuth flow works automatically.

---

## 📸 Screenshots

<!-- screenshot-landing: Hero with animated typing effect and "Try Demo" button -->

<!-- screenshot-dashboard: Connected repos with activity feed polling -->

<!-- screenshot-docs-viewer: File tree sidebar and markdown content viewer -->

<!-- screenshot-demo: Pre-loaded sample documentation without login -->

---

## 🚀 How It Works

1. **Connect Repository** — GitHub OAuth login, select a repo
2. **Analyze Codebase** — Backend fetches file structure and code samples
3. **Generate Docs** — Five specialized agents create:
   - **📖 API Reference** — Functions, parameters, return types
   - **🏗️ Architecture** — Project structure and module relationships
   - **🚢 Deployment** — Setup and deployment instructions
   - **📝 PR Summaries** — Pull request change summaries
   - **📋 Changelog** — Version history and features
4. **Auto-Update** — GitHub webhooks trigger regeneration on push/PR

---

## 🐳 Docker & Deployment

### Build Docker Image

```bash
cd backend
docker build -t docuagent-backend:latest .
docker run -p 3001:3001 --env-file .env docuagent-backend:latest
```

### Deploy Frontend

- **Vercel:** `vercel deploy`
- **Netlify:** Connect GitHub repo, auto-deploys on push
- **GitHub Pages:** `npm run build` → static hosting
- **Self-hosted:** Any Node.js or static host

---

## 🎪 Demo Mode

**No login required!**

1. Click **"Try Demo"** on the landing page
2. Explore pre-generated docs for DocuAgent repository
3. See all five agent outputs in action
4. Perfect for judges and evaluators

---

## 📜 MIT License

This project is licensed under the MIT License — See LICENSE file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🛠️ Architecture

```text
/backend
  /src
    /agents         ← AI agent logic for each doc type
    /routes         ← Express endpoints (OAuth, docs, webhooks)
    /services       ← GitHub API integration
  index.js          ← Server entrypoint
  Dockerfile        ← Container image definition

/frontend
  /src
    /pages          ← Landing, Dashboard, DocsViewer
    /components     ← Reusable UI components
    /context        ← Auth context management
  vite.config.js    ← Vite configuration
  tailwind.config.js ← Tailwind theme settings
```

---

**Built for developers. Powered by AI. Made with ❤️ for the Hackathon.**
