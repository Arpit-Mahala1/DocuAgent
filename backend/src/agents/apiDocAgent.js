import Groq from "groq-sdk";
import path from "path";
import { GitHubService } from "../services/github.js";

function parseExpressRoutes(fileContent) {
  const endpoints = [];
  const lines = fileContent.split(/\r?\n/);
  let currentComment = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line.startsWith("//")) {
      currentComment.push(line.replace(/^\/\//, "").trim());
      continue;
    }

    if (line.startsWith("/*") || line.startsWith("*")) {
      currentComment.push(line.replace(/^[/*]+/, "").trim());
      continue;
    }

    const routeMatch = line.match(/(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*['\"]([^'\"]+)['\"]/i);
    if (routeMatch) {
      const method = routeMatch[1].toUpperCase();
      const pathValue = routeMatch[2];
      const description = currentComment.join(" ") || "Express route handler";
      endpoints.push({ method, path: pathValue, description, requestBody: "Based on route handler input", response: "Standard JSON response" });
      currentComment = [];
      continue;
    }

    const routeFluentMatch = line.match(/(?:app|router)\.route\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\.([a-zA-Z]+)/i);
    if (routeFluentMatch) {
      const pathValue = routeFluentMatch[1];
      const method = routeFluentMatch[2].toUpperCase();
      const description = currentComment.join(" ") || "Express route handler";
      endpoints.push({ method, path: pathValue, description, requestBody: "Based on route handler input", response: "Standard JSON response" });
      currentComment = [];
      continue;
    }

    currentComment = [];
  }

  return endpoints;
}

function parseOpenAPISpec(jsonContent) {
  const endpoints = [];
  if (!jsonContent || typeof jsonContent !== "object") {
    return endpoints;
  }

  const paths = jsonContent.paths || {};
  for (const [pathKey, methods] of Object.entries(paths)) {
    for (const [methodKey, spec] of Object.entries(methods || {})) {
      const method = methodKey.toUpperCase();
      const description = spec.summary || spec.description || "No description provided.";
      let requestBody = "";
      if (spec.requestBody) {
        const content = spec.requestBody.content || {};
        requestBody = Object.keys(content).join(", ") || "Request body defined.";
      }
      const responses = spec.responses || {};
      const responseKeys = Object.keys(responses);
      let response = responseKeys.length > 0 ? responseKeys.join(", ") : "Response schema defined.";
      endpoints.push({ method, path: pathKey, description, requestBody, response });
    }
  }

  return endpoints;
}

async function findApiSource(owner, repo, github, branch) {
  const files = await github.listRepoFiles(owner, repo, branch);
  const openApiPaths = files.filter((item) => /(?:openapi|swagger)\.(json|yaml|yml)$/i.test(item.path));
  const routeCandidates = files.filter((item) => item.path.endsWith(".js") && /(?:routes|router|api)/i.test(item.path));

  const results = [];

  for (const candidate of openApiPaths) {
    try {
      const fileData = await github.getFileContent(owner, repo, candidate.path, branch);
      const trimmed = fileData.content.trim();
      if (trimmed.startsWith("{")) {
        const json = JSON.parse(trimmed);
        const endpoints = parseOpenAPISpec(json);
        if (endpoints.length > 0) {
          return [{ type: "openapi", path: candidate.path, endpoints, content: json }];
        }
      }
    } catch (err) {
      console.warn(`[APIDocAgent] Failed to parse OpenAPI file ${candidate.path}:`, err.message);
    }
  }

  for (const candidate of routeCandidates) {
    try {
      const fileData = await github.getFileContent(owner, repo, candidate.path, branch);
      if (/express\s*\(|router\.(get|post|put|patch|delete)/i.test(fileData.content)) {
        const endpoints = parseExpressRoutes(fileData.content);
        if (endpoints.length > 0) {
          results.push({ type: "express", path: candidate.path, endpoints });
        }
      }
    } catch (err) {
      console.warn(`[APIDocAgent] Failed to read router file ${candidate.path}:`, err.message);
    }
  }

  return results;
}

export async function runAPIDocAgent({ owner, repo, token, branch = "main" }) {
  const github = new GitHubService(token);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in backend environment variables.");
  }
  const groq = new Groq({ apiKey });

  const sources = await findApiSource(owner, repo, github, branch);
  if (sources.length === 0) {
    throw new Error("No API router or OpenAPI/Swagger JSON source found in repository.");
  }

  const descriptionParts = sources.map((source) => {
    const sourceType = source.type === "openapi" ? "OpenAPI/Swagger JSON" : "Express router";
    return `Source: ${sourceType} file ${source.path}\nEndpoints:\n${source.endpoints
      .map((endpoint) => `- ${endpoint.method} ${endpoint.path}: ${endpoint.description}`)
      .join("\n")}`;
  });

  const systemPrompt = `You are an API documentation specialist. Generate clear developer-friendly API reference documentation in Markdown format with tables: Method | Path | Description | Request Body | Response.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.15,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate API documentation for repository ${owner}/${repo}.\n\n${descriptionParts.join("\n\n")}`
      }
    ]
  });

  const apiDocsMarkdown = completion.choices[0]?.message?.content || "";
  const docsPath = "docs/API_REFERENCE.md";
  let existingSha = null;

  try {
    const existing = await github.getFileContent(owner, repo, docsPath, branch);
    existingSha = existing.sha;
  } catch (_) {
    // File may not exist yet
  }

  await github.createOrUpdateFile(token, owner, repo, docsPath, apiDocsMarkdown, "docs: auto-generate API_REFERENCE.md by APIDocAgent", existingSha, branch);

  return {
    success: true,
    docsPath,
    content: apiDocsMarkdown,
    sourceFiles: sources.map((source) => source.path)
  };
}
