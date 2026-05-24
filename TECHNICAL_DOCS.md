# DocuAgent Technical Documentation
=====================================

## Overview
-----------

DocuAgent is an AI-powered documentation assistant designed to automatically generate, update, and manage high-quality technical documentation for GitHub repositories. It utilizes the Anthropic Claude API and the Agentic SDK to inspect file structures, analyze codebases, and write professional Markdown documentations back to GitHub.

## Tech Stack and Key Dependencies
---------------------------------

* **Backend Core**: Node.js & Express (ES Modules)
* **LLM Engine**: Anthropic Claude (`@anthropic-ai/sdk`)
* **Agent Framework**: Agentic SDK (`@agentic/core`)
* **GitHub Integration**: Octokit (`octokit` & `axios`)
* **Frontend**: React + Vite
* **Styling**: Tailwind CSS v4 (Glassmorphic dark design)

## Installation and Startup Instructions
-----------------------------------------

### Backend Setup

1. Navigate to the backend directory: `cd backend`
2. Configure the environment variables: `copy .env.example .env`
3. Open `.env` and configure your credentials:
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

## Architecture Summary and Directory Layout
--------------------------------------------

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

## Main APIs and Endpoints
-------------------------

### Authentication Endpoints

* **GET /auth/github**: Redirects to GitHub's authorization page
* **GET /auth/github/callback**: Exchanges authorization code for access token and redirects back to React application

### Documentation Endpoints

* **GET /api/docs/:owner/:repo**: Retrieves a list of Markdown files in the repository
* **GET /api/docs/:owner/:repo/***: Retrieves the content of a specific Markdown file
* **POST /api/generate**: Triggers the documentation generation process for a repository

### Repository Endpoints

* **GET /api/repos**: Retrieves a list of connected repositories for the user
* **POST /api/connect-repo**: Connects a new repository to the user's account

### User Endpoints

* **GET /api/user**: Retrieves the user's information (login, avatar URL)

### Health Endpoints

* **GET /health**: Checks the health of the Express API

### Webhook Endpoints

* **POST /webhook**: Handles incoming webhooks from GitHub

### Agent Endpoints

* **GET /api/agent-logs**: Retrieves the logs of the AI agent
* **POST /api/generate**: Triggers the documentation generation process for a repository

Note: This documentation is based on the provided codebase and may not be exhaustive. Additional endpoints or APIs may be present in the codebase.