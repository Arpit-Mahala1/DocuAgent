# DocuAgent Technical Documentation
=====================================

## Overview
-----------

DocuAgent is an AI-powered documentation generation tool designed to automate the process of creating and updating technical documentation for GitHub repositories. The application utilizes a combination of natural language processing (NLP) and machine learning algorithms to analyze codebases and generate high-quality documentation.

## Tech Stack and Key Dependencies
------------------------------------

The DocuAgent application is built using the following technologies:

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
------------------------------------------

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

The DocuAgent application consists of two main components: the backend and the frontend.

### Backend

The backend is built using Node.js and Express.js, and is responsible for handling API requests, interacting with the GitHub API, and generating documentation using the Groq SDK.

* **/src**: Source code for the backend application
	+ **/agents**: AI agent logic for each doc type
	+ **/routes**: Express endpoints (OAuth, docs, webhooks)
	+ **/services**: GitHub API integration
* **index.js**: Server entrypoint
* **Dockerfile**: Container image definition

### Frontend

The frontend is built using React and Vite, and is responsible for rendering the user interface and handling user interactions.

* **/src**: Source code for the frontend application
	+ **/pages**: Landing, Dashboard, DocsViewer
	+ **/components**: Reusable UI components
	+ **/context**: Auth context management
* **vite.config.js**: Vite configuration
* **tailwind.config.js**: Tailwind theme settings

## Main APIs and Endpoints
---------------------------

The DocuAgent backend exposes the following APIs and endpoints:

* **/api/user**: Returns information about the current user
* **/api/repos**: Returns a list of connected repositories
* **/api/repo/:owner/:repo/tree**: Returns the file tree for a given repository
* **/api/docs/:owner/:repo**: Returns the documentation for a given repository
* **/api/docs/:owner/:repo/***: Returns the content of a specific file in a repository
* **/api/agent-logs**: Returns the logs for the AI agents
* **/api/generate**: Triggers the generation of documentation for a given repository
* **/api/connect-repo**: Connects a new repository to the DocuAgent application

## GitHub OAuth App Setup
---------------------------

To use the DocuAgent application, you need to set up a GitHub OAuth app and configure the application to use your app credentials.

1. Navigate to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application name, homepage URL, and authorization callback URL
4. Copy the client ID and client secret into your `.env` file

## Docker and Deployment
-------------------------

The DocuAgent application can be deployed using Docker and Vercel.

### Build Docker Image

1. Navigate to the backend directory: `cd DocuAgent/backend`
2. Build the Docker image: `docker build -t docuagent-backend:latest .`
3. Run the Docker container: `docker run -p 3001:3001 --env-file .env docuagent-backend:latest`

### Deploy Frontend

1. Navigate to the frontend directory: `cd DocuAgent/frontend`
2. Deploy the frontend application using Vercel: `vercel deploy`

## Demo Mode
-------------

The DocuAgent application includes a demo mode that allows you to try out the application without logging in.

1. Click **"Try Demo"** on the landing page
2. Explore the pre-generated documentation for the DocuAgent repository
3. See all five agent outputs in action

## License
---------

The DocuAgent application is licensed under the MIT License. See the LICENSE file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)