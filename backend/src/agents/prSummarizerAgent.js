import Groq from "groq-sdk";
import { Octokit } from "octokit";
import { GitHubService } from "../services/github.js";
import { runCodeParserAgent } from "./codeParserAgent.js";

function parsePRDiff(files) {
  return files.map((file) => {
    const patch = file.patch || "";
    const patchLines = patch.split(/\r?\n/);
    const added = patchLines.filter((line) => line.startsWith("+") && !line.startsWith("+++ ")).length;
    const removed = patchLines.filter((line) => line.startsWith("-") && !line.startsWith("--- ")).length;
    const changed = added + removed;
    const preview = patchLines.filter((line) => line.startsWith("+") || line.startsWith("-")).slice(0, 10).join("\n");
    return {
      filename: file.filename,
      status: file.status,
      added,
      removed,
      changed,
      preview: preview || "No patch preview available."
    };
  });
}

export async function runPRSummarizerAgent({ owner, repo, token, prNumber }) {
  if (!owner || !repo || !prNumber) {
    throw new Error("Missing owner, repo, or prNumber for PR summarization.");
  }

  const github = new GitHubService(token);
  const octokit = new Octokit({ auth: token });

  const prNum = parseInt(prNumber, 10);
  if (Number.isNaN(prNum)) throw new Error("Invalid prNumber provided");
  const prResponse = await octokit.rest.pulls.get({ owner, repo, pull_number: prNum });
  const pr = prResponse.data;
  const branch = pr.base?.ref || "main";

  const filesResponse = await octokit.rest.pulls.listFiles({ owner, repo, pull_number: prNum, per_page: 100 });
  const changedFiles = filesResponse.data.filter((file) => file.filename.endsWith(".js") || file.filename.endsWith(".ts") || file.filename.endsWith(".py"));

  if (changedFiles.length === 0) {
    throw new Error("No supported code files were changed in this pull request.");
  }

  const diffSummary = parsePRDiff(changedFiles);
  const summaryLines = diffSummary.map((file) => `- ${file.filename}: +${file.added} / -${file.removed} (${file.status})`).join("\n");
  const prompt = `Given this pull request diff for ${owner}/${repo} PR #${prNumber}, summarize technical changes for documentation. Identify new features, bug fixes, or breaking changes.\n\nFiles changed:\n${summaryLines}\n\nDetailed diff summary:\n${diffSummary
    .map((file) => `File: ${file.filename}\nAdded: ${file.added}, Removed: ${file.removed}, Changed: ${file.changed}\nPreview:\n${file.preview}`)
    .join("\n\n")}`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in backend environment variables.");
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.18,
    messages: [
      {
        role: "system",
        content: "Given this pull request diff, summarize technical changes for documentation. Identify new features, bug fixes, or breaking changes."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const summaryMarkdown = completion.choices[0]?.message?.content || "";
  const docsPath = "docs/PR_CHANGES.md";
  let existingSha = null;

  try {
    const existing = await github.getFileContent(owner, repo, docsPath, branch);
    existingSha = existing.sha;
  } catch (_) {
    // File may not exist yet
  }

  await github.createOrUpdateFile(token, owner, repo, docsPath, summaryMarkdown, "docs: auto-generate PR_CHANGES.md by PRSummarizerAgent", existingSha, branch);

  const changedFileNames = changedFiles.map((file) => file.filename);
  runCodeParserAgent({ owner, repo, token, branch, files: changedFileNames }).catch((err) => {
    console.error(`[PRSummarizerAgent] CodeParserAgent follow-up failed for PR #${prNumber}:`, err);
  });

  return {
    success: true,
    docsPath,
    prNumber: prNum,
    changedFiles: changedFileNames,
    content: summaryMarkdown
  };
}
