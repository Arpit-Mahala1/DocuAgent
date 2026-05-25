# DocuAgent Technical Documentation
=====================================

## Overview
-----------

DocuAgent is an AI-powered documentation generation tool designed to automate the process of creating and updating technical documentation for GitHub repositories. The application utilizes a combination of natural language processing (NLP) and machine learning algorithms to analyze codebases and generate high-quality documentation.

## Tech Stack and Key Dependencies
---------------------------------

The DocuAgent application is built using a combination of technologies, including:

* **Backend Runtime:** Node.js 20 (ES Modules)
* **Backend Framework:** Express.js
* **AI/LLM:** Groq SDK with Llama 3.3
* **GitHub Integration:** Octokit + GitHub REST API
* **Frontend Framework:** React 18
* **Frontend Tooling:** Vite 5
* **Styling:** Tailwind CSS 4
* **UI Components:** Lucide React icons, React Hot Toast
* **Markdown:** react-markdown + rehype-highlight

## Installation and Startup Instructions
-----------------------------------------

### Prerequisites

* **Node.js 18+** installed
* **GitHub account** with OAuth app credentials
* **Groq API key** (free at [console.groq.com](https://console.groq.com))

### Backend Setup

1. Clone the repository: `git clone https://github.com/your-username/DocuAgent.git`
2. Navigate to the backend directory: `cd DocuAgent/backend`
3. Install dependencies: `npm install`
4. Configure environment variables: `cp .env.example .env` and edit the `.env` file with your Groq API key, GitHub OAuth app credentials, and other settings
5. Run the development server: `npm run dev`

### Frontend Setup

1. Navigate to the frontend directory: `cd DocuAgent/frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Architecture Summary and Directory Layout
---------------------------------------------

The DocuAgent application is organized into two main directories: `backend` and `frontend`.

### Backend Directory Layout

* `src/agents`: AI agent logic for each documentation type
* `src/routes`: Express endpoints for OAuth, documentation, and webhooks
* `src/services`: GitHub API integration
* `index.js`: Server entrypoint
* `Dockerfile`: Container image definition

### Frontend Directory Layout

* `src/pages`: Landing, Dashboard, and DocsViewer pages
* `src/components`: Reusable UI components
* `src/context`: Auth context management
* `vite.config.js`: Vite configuration
* `tailwind.config.js`: Tailwind theme settings

## Main APIs and Endpoints
---------------------------

The DocuAgent backend exposes several APIs and endpoints for interacting with the application:

* **GET /api/user**: Retrieves the current user's information
* **GET /api/repos**: Retrieves a list of connected repositories
* **GET /api/repo/:owner/:repo/tree**: Retrieves the file tree for a specific repository
* **GET /api/docs/:owner/:repo**: Retrieves the documentation for a specific repository
* **GET /api/docs/:owner/:repo/***: Retrieves the content of a specific file in a repository
* **POST /api/generate**: Triggers the documentation generation process for a specific repository
* **POST /api/connect-repo**: Connects a new repository to the application

## GitHub OAuth App Setup
-------------------------

To set up the GitHub OAuth app, follow these steps:

1. Navigate to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application name, homepage URL, and authorization callback URL
4. Copy the client ID and client secret into the `.env` file

## Docker and Deployment
-------------------------

The DocuAgent backend can be deployed using Docker. To build the Docker image, run the following command:

```bash
cd backend
docker build -t docuagent-backend:latest .
docker run -p 3001:3001 --env-file .env docuagent-backend:latest
```

The frontend can be deployed using Vercel, Netlify, or any other static hosting platform.

## Demo Mode
-------------

The DocuAgent application includes a demo mode that allows users to try out the application without logging in. To access the demo mode, click the **Try Demo** button on the landing page.

## License
---------

The DocuAgent application is licensed under the MIT License. See the LICENSE file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)