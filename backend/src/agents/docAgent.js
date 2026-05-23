import Groq from "groq-sdk";
import { GitHubService } from "../services/github.js";

/**
 * Main documentation generation routine using Groq & GitHub Service
 * This skeleton sets up the agent prompts and execution loop.
 */
export async function generateDocs({ owner, repo, branch, token }) {
  console.log(`[DocuAgent] Starting documentation process for ${owner}/${repo} (${branch}) via Groq...`);

  // Initialize service & Groq client
  const github = new GitHubService(token);
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in backend environment variables.");
  }

  const groq = new Groq({ apiKey });

  // 1. Fetch file list to give context to the Agent
  const files = await github.listRepoFiles(owner, repo, branch);
  const fileListStr = files.map((f) => `- ${f.path} (${f.size} bytes)`).join("\n");

  // 2. Fetch key entry files (like package.json, README.md, principal entry points)
  let mainCodeContext = "";
  const filesToRead = ["package.json", "index.js", "src/index.js", "README.md"];

  for (const path of filesToRead) {
    const matching = files.find((f) => f.path === path || f.path.endsWith("/" + path));
    if (matching) {
      try {
        const fileData = await github.getFileContent(owner, repo, matching.path, branch);
        mainCodeContext += `\n\n--- File: ${matching.path} ---\n${fileData.content}`;
      } catch (err) {
        console.warn(`[DocuAgent] Skip auto-reading optional file: ${path}`);
      }
    }
  }

  // 3. System prompt for DocuAgent
  const systemPrompt = `You are DocuAgent, an AI documentation assistant.
Your goal is to auto-generate and update beautiful technical documentation (e.g. README.md or API_DOCS.md) for GitHub repositories.
You are given a list of files in the project and the contents of key codebase entrypoints.

Analyze the codebase and write professional technical documentation including:
1. Short overview of the application
2. Tech stack and key dependencies
3. Basic installation and startup instructions
4. Architecture summary and directory layout
5. Main APIs or endpoints if present

Output the response in clean, high-quality Markdown format.`;

  // 4. Invoke Groq Completions API with Llama 3.3 70B
  console.log("[DocuAgent] Requesting documentation structure from Groq Llama 3.3...");
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Here is the codebase overview for ${owner}/${repo}:
        
FILES:
${fileListStr}

KEY FILE CONTENTS:
${mainCodeContext}

Please generate the comprehensive technical documentation for this repository.`
      }
    ]
  });

  const generatedDocs = completion.choices[0]?.message?.content || "";

  // 5. Save the generated documentation back to GitHub
  const docsPath = "TECHNICAL_DOCS.md";
  let existingSha = null;

  // Check if file already exists to get its SHA
  try {
    const existingFile = await github.getFileContent(owner, repo, docsPath, branch);
    existingSha = existingFile.sha;
  } catch (e) {
    // File doesn't exist, which is fine
  }

  console.log(`[DocuAgent] Committing generated documentation to repository path: ${docsPath}`);
  await github.createOrUpdateFile(
    owner,
    repo,
    docsPath,
    generatedDocs,
    "docs: auto-generate TECHNICAL_DOCS.md by DocuAgent (via Groq Llama3.3)",
    existingSha,
    branch
  );

  console.log(`[DocuAgent] Successfully updated documentation for ${owner}/${repo}!`);
  return {
    success: true,
    filePath: docsPath,
    content: generatedDocs
  };
}
