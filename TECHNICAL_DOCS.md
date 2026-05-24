# DocuAgent Technical Documentation
=====================================

## Overview
-----------

DocuAgent is an AI-powered documentation assistant designed to automatically generate, update, and manage high-quality technical documentation for GitHub repositories. It integrates with GitHub using Octokit and utilizes the Anthropic Claude API to inspect file structures, analyze codebases, and write professional Markdown documentation.

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

## Architecture Summary
---------------------

The DocuAgent application consists of two main components: the backend and the frontend.

### Backend

The backend is built using Node.js and Express, and is responsible for:

* Handling GitHub OAuth flow
* Inspecting file structures and analyzing codebases using the Anthropic Claude API
* Generating and updating technical documentation
* Providing API endpoints for the frontend to interact with

The backend directory layout is as follows:
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

### Frontend

The frontend is built using React and Vite, and is responsible for:

* Providing a user interface for users to interact with the application
* Displaying generated technical documentation
* Handling user input and sending requests to the backend API

The frontend directory layout is as follows:
```text
/frontend
  /src
    App.jsx         ← Dashboard interface with glassmorphism design
    index.css       ← Tailwind CSS v4 design layers and modern Outfit fonts
    main.jsx        ← React entry node config
  vite.config.js    ← Custom Vite and Tailwind integration
```

## API Endpoints
----------------

The backend provides the following API endpoints:

* **GET /health**: Returns the health status of the application
* **POST /auth/github**: Handles GitHub OAuth flow
* **GET /api/docs**: Returns generated technical documentation
* **POST /api/connect-repo**: Connects a GitHub repository to the application
* **POST /webhook**: Handles webhook events from GitHub

## GitHub OAuth Flow
---------------------

The application uses the following GitHub OAuth flow:

1. The user clicks the "Connect GitHub" button on the dashboard.
2. The user is redirected to the backend `/auth/github` endpoint, which builds the scopes and redirects to GitHub's authorization page.
3. Upon approval, GitHub redirects back to `/auth/github/callback` with an authorization code.
4. The backend exchanges this code for an access token via Axios and redirects the user back to the React application passing the token.
5. React retrieves the token, sanitizes the URL bar, and keeps it in local state for safe repository write-back actions.

## Contributing
------------

Contributions to the DocuAgent project are welcome. Please submit a pull request with your changes and a brief description of what you've added or fixed.

## License
-------

The DocuAgent project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.