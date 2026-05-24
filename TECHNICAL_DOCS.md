# DocuAgent Technical Documentation
=====================================

## Overview
-----------

DocuAgent is an AI-powered documentation assistant designed to automatically generate, update, and manage high-quality technical documentation for GitHub repositories. It utilizes the Anthropic Claude API and Agentic SDK to inspect file structures, analyze codebases, and write professional Markdown documentations.

## Tech Stack
-------------

* **Backend Core**: Node.js & Express (ES Modules)
* **LLM Engine**: Anthropic Claude (`@anthropic-ai/sdk`)
* **Agent Framework**: Agentic SDK (`@agentic/core`)
* **GitHub Integration**: Octokit (`octokit` & `axios`)
* **Frontend**: React + Vite
* **Styling**: Tailwind CSS v4 (Glassmorphic dark design)

## Installation and Startup
---------------------------

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

## Architecture Summary
----------------------

The DocuAgent application consists of two main components:

* **Backend**: Handles API requests, GitHub integration, and documentation generation.
* **Frontend**: Provides a user interface for connecting GitHub repositories and viewing generated documentation.

The backend is built using Node.js and Express, with the following directory structure:
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
```
The frontend is built using React and Vite, with the following directory structure:
```text
/frontend
  /src
    App.jsx         ← Dashboard interface with glassmorphism design
    index.css       ← Tailwind CSS v4 design layers and modern Outfit fonts
    main.jsx        ← React entry node config
  vite.config.js    ← Custom Vite and Tailwind integration
```
## APIs and Endpoints
---------------------

The DocuAgent backend provides the following APIs and endpoints:

### Authentication

* **GET /auth/github**: Redirects to GitHub's authorization page for OAuth flow.
* **GET /auth/github/callback**: Handles GitHub authorization code and redirects back to React application.

### Documentation Generation

* **POST /api/generate**: Triggers documentation generation for a specified repository.
* **GET /api/docs/:owner/:repo**: Retrieves a list of documentation files for a repository.
* **GET /api/docs/:owner/:repo/***: Retrieves the content of a specific documentation file.

### Repository Management

* **POST /api/connect-repo**: Connects a repository to DocuAgent for documentation generation.
* **GET /api/repos**: Retrieves a list of connected repositories.

### User Information

* **GET /api/user**: Retrieves user information, including login and avatar URL.

### Health Check

* **GET /health**: Performs a health check on the backend server.

## GitHub OAuth Flow
---------------------

1. Click **Connect GitHub** on the dashboard.
2. The user is redirected to the backend `/auth/github` endpoint, which builds the scopes and redirects to GitHub's authorization page.
3. Upon approval, GitHub redirects back to `/auth/github/callback` with an authorization code.
4. The backend exchanges this code for an access token via Axios and redirects the user back to the React application passing the token.
5. React retrieves the token, sanitizes the URL bar, and keeps it in local state for safe repository write-back actions.

## Troubleshooting
-----------------

* Check the backend server logs for errors.
* Verify that environment variables are correctly configured.
* Ensure that the frontend and backend are running on the correct ports.

## Contributing
------------

Contributions are welcome! Please submit a pull request with your changes and a brief description of the changes made.

## License
-------

DocuAgent is licensed under the [MIT License](LICENSE).