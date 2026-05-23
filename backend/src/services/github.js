import { Octokit } from "octokit";

/**
 * GitHubService class simplifies interacting with the GitHub API
 */
export class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Get details of a single file
   */
  async getFileContent(owner, repo, path, ref = "main") {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(response.data)) {
        throw new Error("Target path is a directory, not a file.");
      }

      // GitHub returns base64 encoded content
      const content = Buffer.from(response.data.content, "base64").toString("utf-8");
      return {
        content,
        sha: response.data.sha,
        size: response.data.size
      };
    } catch (error) {
      console.error(`[GitHubService] Failed to read file ${path}:`, error.message);
      throw error;
    }
  }

  /**
   * List files recursively inside a folder/repository
   */
  async listRepoFiles(owner, repo, ref = "main") {
    try {
      // Fetch the git tree recursively
      const { data: commitData } = await this.octokit.rest.repos.getCommit({
        owner,
        repo,
        ref
      });

      const treeSha = commitData.commit.tree.sha;

      const { data: treeData } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: true
      });

      // Filter out files (not blobs, directories or submodules)
      return treeData.tree
        .filter((item) => item.type === "blob")
        .map((item) => ({
          path: item.path,
          size: item.size,
          sha: item.sha
        }));
    } catch (error) {
      console.error(`[GitHubService] Failed to list tree for ${owner}/${repo}:`, error.message);
      throw error;
    }
  }

  /**
   * Create or update a file on GitHub
   */
  async createOrUpdateFile(owner, repo, path, content, message, sha = null, branch = "main") {
    try {
      const base64Content = Buffer.from(content).toString("base64");

      const params = {
        owner,
        repo,
        path,
        message,
        content: base64Content,
        branch
      };

      if (sha) {
        params.sha = sha;
      }

      const response = await this.octokit.rest.repos.createOrUpdateFileContents(params);
      return response.data;
    } catch (error) {
      console.error(`[GitHubService] Failed to write file ${path}:`, error.message);
      throw error;
    }
  }
}
