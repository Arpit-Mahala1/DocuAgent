import Groq from "groq-sdk";
import { Octokit } from "octokit";
import { GitHubService } from "../services/github.js";

function formatChangelogEntry(changelogText) {
  const header = `# Changelog\n\n`;
  if (changelogText.trim().startsWith("# Changelog")) {
    return changelogText;
  }
  return `${header}${changelogText.trim()}\n`;
}

export async function runDeploymentChangeAgent({ owner, repo, token, branch = "main" }) {
  if (!owner || !repo) {
    throw new Error("Missing owner or repo for deployment changelog generation.");
  }

  const github = new GitHubService(token);
  const octokit = new Octokit({ auth: token });

  const commitsResponse = await octokit.rest.repos.listCommits({ owner, repo, per_page: 10, sha: branch });
  const commitMessages = commitsResponse.data.map((commit) => {
    const message = commit.commit?.message?.split("\n")[0] || "Untitled commit";
    return `- ${message}`;
  });

  let versionNote = "";
  try {
    const packageData = await github.getFileContent(owner, repo, "package.json", branch);
    const pkg = JSON.parse(packageData.content);
    if (pkg.version) {
      versionNote = `Current package version: ${pkg.version}`;
    }
  } catch (err) {
    // package.json may not exist; continue using commit messages
  }

  const prompt = `Based on these commit messages and version change, generate a CHANGELOG entry following Keep a Changelog format (Added, Changed, Fixed, Breaking Changes).\n\n${versionNote ? versionNote + "\n\n" : ""}Commits:\n${commitMessages.join("\n")}`;

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
        content: "Based on these commit messages and version change, generate a CHANGELOG entry following Keep a Changelog format (Added, Changed, Fixed, Breaking Changes)."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const changelogEntry = completion.choices[0]?.message?.content || "";
  const docsPath = "docs/CHANGELOG.md";

  let existingSha = null;
  let existingContent = "";
  try {
    const existing = await github.getFileContent(owner, repo, docsPath, branch);
    existingSha = existing.sha;
    existingContent = existing.content;
  } catch (_) {
    existingContent = "";
  }

  const normalizedEntry = changelogEntry.trim();
  const finalContent = existingContent
    ? `${normalizedEntry}\n\n${existingContent}`
    : formatChangelogEntry(normalizedEntry);

  await github.createOrUpdateFile(token, owner, repo, docsPath, finalContent, "docs: update CHANGELOG.md by DeploymentChangeAgent", existingSha, branch);

  return {
    success: true,
    docsPath,
    content: finalContent,
    versionNote: versionNote || null
  };
}
