API Reference Documentation
==========================

### Authentication Endpoints

| Method | Path | Description | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | /auth/github | Redirects the user to GitHub OAuth login page | - | Redirect to GitHub OAuth login page |
| GET | /auth/github/callback | Handles authorization code exchange for an access token | - | Access token and user details |
| GET | /auth/session | Returns stored user details and repos for an active session token | - | User details and repository information |

### Documentation Endpoints

| Method | Path | Description | Request Body | Response |
| --- | --- | --- | --- | --- |
| POST | /api/docs/generate | Triggers the documentation generation agent for a given repo | Repository information (e.g., owner, name) | Documentation generation status |
| POST | /api/docs/parse | Runs CodeParserAgent on the specified local directory path or remote GitHub repository | Directory path or GitHub repository information (e.g., owner, name) | Parsed code information |

### Health Endpoints

| Method | Path | Description | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | / | Express route handler | - | Server status |

### Webhook Endpoints

| Method | Path | Description | Request Body | Response |
| --- | --- | --- | --- | --- |
| POST | /github | Express route handler for GitHub webhooks | Webhook event data | Webhook processing status |

### Request Body Examples

* `/api/docs/generate`:
```json
{
  "owner": "Arpit-Mahala1",
  "name": "DocuAgent"
}
```
* `/api/docs/parse`:
```json
{
  "path": "/local/directory/path",
  "owner": "Arpit-Mahala1",
  "name": "DocuAgent"
}
```
* `/github` (webhook):
```json
{
  "event": "push",
  "repository": {
    "owner": "Arpit-Mahala1",
    "name": "DocuAgent"
  }
}
```
Note: The request body examples are provided for illustration purposes only and may vary depending on the specific use case.