# 🤖 DocuAgent — Hackathon Edition

DocuAgent is an agentic AI assistant designed to automatically generate, update, and manage high-quality technical documentation for your repositories. It integrates directly with GitHub using Octokit and utilizes the **Anthropic Claude API** powered by the **Agentic SDK** to inspect file structures, analyze codebases, and write professional Markdown documentations back to GitHub.

---

## 🏗️ Architecture Layout

```text
/backend
  /src
    /agents         ← AI agent loop and prompt configurations
    /routes         ← Express routing endpoints (OAuth, doc generation, health)
    /services       ← External APIs (GitHub Octokit wrappers)
    /utils          ← Helpers and validation
    index.js        ← Main server configurations and middleware setup
  index.js          ← Entrypoint delegation file
  .env.example      ← Environment configuration template
/frontend
  /src
    App.jsx         ← Dashboard interface with glassmorphism design
    index.css       ← Tailwind CSS v4 design layers and modern Outfit fonts
    main.jsx        ← React entry node config
  vite.config.js    ← Custom Vite and Tailwind integration
README.md           ← Complete setup documentation
```

---

## ⚡ Tech Stack

* **Backend Core**: Node.js & Express (ES Modules)
* **LLM Engine**: Anthropic Claude (`@anthropic-ai/sdk`)
* **Agent Framework**: Agentic SDK (`@agentic/core`)
* **GitHub Integration**: Octokit (`octokit` & `axios`)
* **Frontend**: React + Vite
* **Styling**: Tailwind CSS v4 (Glassmorphic dark design)

---

## ⚙️ Configuration & Setup

### 1. Backend Setup

First, navigate to the backend directory and configure the environment variables:
```bash
cd backend
copy .env.example .env
```
Open `.env` and configure your credentials:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
ANTHROPIC_API_KEY=your_anthropic_api_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
```

To run the server in development mode:
```bash
npm run dev
```

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`. When loaded, it will check the health of the Express API running on `http://localhost:3001` automatically.

---

## 🛡️ GitHub OAuth Flow

1. Click **Connect GitHub** on the dashboard.
2. The user is redirected to the backend `/auth/github` endpoint, which builds the scopes and redirects to GitHub's authorization page.
3. Upon approval, GitHub redirects back to `/auth/github/callback` with an authorization code.
4. The backend exchanges this code for an access token via Axios and redirects the user back to the React application passing the token.
5. React retrieves the token, sanitizes the URL bar, and keeps it in local state for safe repository write-back actions.
