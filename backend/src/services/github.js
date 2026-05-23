import { Octokit } from "octokit";

/**
 * GitHubService class simplifies interacting with the GitHub API
 */
export class GitHubService {
  constructor(token) {
    this.token = token;
    if (token) {
      this.octokit = new Octokit({ auth: token });
    }
  }

  /**
   * Helper to retrieve Octokit client using passed token or constructor token
   */
  _getOctokit(token) {
    if (token) {
      return new Octokit({ auth: token });
    }
    if (this.octokit) {
      return this.octokit;
    }
    throw new Error("No GitHub access token provided.");
  }

  /**
   * Helper to identify if string is a GitHub access token
   */
  _isToken(str) {
    if (typeof str !== "string") return false;
    return str.startsWith("gh") || str.startsWith("github") || str.length > 35;
  }

  /**
   * List repositories for the authenticated user
   * listUserRepos(token) or listUserRepos()
   */
  async listUserRepos(token) {
    const activeToken = token || this.token;
    const octokit = this._getOctokit(activeToken);
    try {
      const response = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 100,
        sort: "updated"
      });
      return response.data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.owner.login,
        private: repo.private,
        html_url: repo.html_url
      }));
    } catch (error) {
      console.error("[GitHubService] Failed to list repositories:", error.message);
      throw error;
    }
  }

  /**
   * Get all file paths recursively inside repository
   * getRepoFileTree(token, owner, repo) or getRepoFileTree(owner, repo)
   */
  async getRepoFileTree(tokenOrOwner, ownerOrRepo, repoVal, refVal = "main") {
    let token, owner, repo, ref;

    if (this._isToken(tokenOrOwner)) {
      token = tokenOrOwner;
      owner = ownerOrRepo;
      repo = repoVal;
      ref = refVal;
    } else {
      token = this.token;
      owner = tokenOrOwner;
      repo = ownerOrRepo;
      ref = repoVal || "main";
    }

    const octokit = this._getOctokit(token);
    try {
      const { data: commitData } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref
      });

      const treeSha = commitData.commit.tree.sha;

      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: true
      });

      return treeData.tree
        .filter((item) => item.type === "blob")
        .map((item) => item.path);
    } catch (error) {
      console.error(`[GitHubService] Failed to get file tree for ${owner}/${repo}:`, error.message);
      throw error;
    }
  }

  /**
   * List files recursively inside a repository (retaining backward compatibility)
   */
  async listRepoFiles(owner, repo, ref = "main") {
    try {
      const octokit = this._getOctokit(this.token);
      const { data: commitData } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref
      });

      const treeSha = commitData.commit.tree.sha;

      const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: true
      });

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
   * Get details/content of a single file
   * getFileContent(token, owner, repo, filePath, ref) or getFileContent(owner, repo, path, ref)
   */
  async getFileContent(tokenOrOwner, ownerOrRepo, repoOrPath, pathOrRef, refVal = "main") {
    let token, owner, repo, path, ref;

    if (this._isToken(tokenOrOwner)) {
      token = tokenOrOwner;
      owner = ownerOrRepo;
      repo = repoOrPath;
      path = pathOrRef;
      ref = refVal;
    } else {
      token = this.token;
      owner = tokenOrOwner;
      repo = ownerOrRepo;
      path = repoOrPath;
      ref = pathOrRef || "main";
    }

    const octokit = this._getOctokit(token);
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(response.data)) {
        throw new Error("Target path is a directory, not a file.");
      }

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
   * Create or update a file on GitHub
   * createOrUpdateFile(token, owner, repo, path, content, commitMessage, branch)
   * or createOrUpdateFile(owner, repo, path, content, message, sha, branch)
   */
  async createOrUpdateFile(
    tokenOrOwner,
    ownerOrRepo,
    repoOrPath,
    pathOrContent,
    contentOrMessage,
    messageOrSha = null,
    branchOrSha = null,
    maybeBranch = "main"
  ) {
    let token, owner, repo, path, content, message, branch, sha;

    if (this._isToken(tokenOrOwner)) {
      token = tokenOrOwner;
      owner = ownerOrRepo;
      repo = repoOrPath;
      path = pathOrContent;
      content = contentOrMessage;
      message = messageOrSha;
      branch = branchOrSha || "main";
      sha = null;
    } else {
      token = this.token;
      owner = tokenOrOwner;
      repo = ownerOrRepo;
      path = repoOrPath;
      content = pathOrContent;
      message = contentOrMessage;
      sha = messageOrSha;
      branch = branchOrSha || "main";
    }

    const octokit = this._getOctokit(token);

    // Proactively fetch sha if not provided, to avoid collision (409 Conflict)
    if (!sha) {
      try {
        const response = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });
        if (!Array.isArray(response.data)) {
          sha = response.data.sha;
        }
      } catch (err) {
        // File doesn't exist, which is fine
      }
    }

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

      const response = await octokit.rest.repos.createOrUpdateFileContents(params);
      return response.data;
    } catch (error) {
      console.error(`[GitHubService] Failed to write file ${path}:`, error.message);
      throw error;
    }
  }
}
