# DocuAgent Technical Documentation
=====================================

## Overview
------------

DocuAgent is an AI-powered documentation tool designed to automatically generate, update, and manage high-quality technical documentation for GitHub repositories. It utilizes the Anthropic Claude API and Agentic SDK to inspect file structures, analyze codebases, and write professional Markdown documentation.

## Tech Stack
-------------

* **Backend Core**: Node.js & Express (ES Modules)
* **LLM Engine**: Anthropic Claude (`@anthropic-ai/sdk`)
* **Agent Framework**: Agentic SDK (`@agentic/core`)
* **GitHub Integration**: Octokit (`octokit` & `axios`)
* **Frontend**: React + Vite
* **Styling**: Tailwind CSS v4 (Glassmorphic dark design)

## Installation and Setup
-------------------------

### Backend Setup

1. Navigate to the backend directory: `cd backend`
2. Configure environment variables: `copy .env.example .env`
3. Open `.env` and configure credentials:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
ANTHROPIC_API_KEY=your_anthropic_api_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
```
4. Run the server in development mode: `npm run dev`

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`

The frontend will run on `http://localhost:5173`. When loaded, it will check the health of the Express API running on `http://localhost:3001` automatically.

## Architecture Summary
----------------------

The DocuAgent application consists of two main components: the backend and the frontend.

### Backend

* **Entry Point**: `backend/index.js`
* **Server Configuration**: `backend/src/index.js`
* **Routes**:
	+ `/health`: Health check endpoint
	+ `/auth`: Authentication endpoint
	+ `/api/docs`: Documentation generation endpoint
	+ `/webhook`: Webhook endpoint
* **Services**:
	+ `github.js`: GitHub Octokit wrapper
* **Agents**:
	+ `codeParserAgent.js`: Code parser agent
	+ `docAgent.js`: Documentation agent

### Frontend

* **Entry Point**: `frontend/src/main.jsx`
* **Components**:
	+ `App.jsx`: Dashboard interface
	+ `DocsSidebar.jsx`: Documentation sidebar
	+ `Logo.jsx`: Logo component
	+ `MarkdownViewer.jsx`: Markdown viewer
	+ `RepoCard.jsx`: Repository card
	+ `RepoSelector.jsx`: Repository selector
	+ `ToastProvider.jsx`: Toast provider
* **Pages**:
	+ `Dashboard.jsx`: Dashboard page
	+ `DocsViewer.jsx`: Documentation viewer page
	+ `Landing.jsx`: Landing page

## APIs and Endpoints
----------------------

### Backend Endpoints

* **GET /health**: Health check endpoint
* **POST /auth/github**: GitHub authentication endpoint
* **GET /auth/github/callback**: GitHub authentication callback endpoint
* **POST /api/docs**: Documentation generation endpoint
* **POST /webhook**: Webhook endpoint
* **POST /api/connect-repo**: Connect repository endpoint

### Frontend APIs

* **apiClient.js**: API client for making requests to the backend

## GitHub OAuth Flow
---------------------

1. Click **Connect GitHub** on the dashboard.
2. The user is redirected to the backend `/auth/github` endpoint, which builds the scopes and redirects to GitHub's authorization page.
3. Upon approval, GitHub redirects back to `/auth/github/callback` with an authorization code.
4. The backend exchanges this code for an access token via Axios and redirects the user back to the React application passing the token.
5. React retrieves the token, sanitizes the URL bar, and keeps it in local state for safe repository write-back actions.

## Directory Layout
-------------------

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