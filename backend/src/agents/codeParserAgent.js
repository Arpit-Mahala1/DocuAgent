import fs from "fs/promises";
import path from "path";
import Groq from "groq-sdk";
import { GitHubService } from "../services/github.js";

/**
 * TOOL 1: readLocalFiles(folderPath)
 * Recursively reads all .js, .ts, .py files, extracts file names and content,
 * skipping node_modules, .git, and dist folders.
 */
export async function readLocalFiles(folderPath) {
  const filesList = [];

  async function traverse(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      // Skip node_modules, .git, and common build artifacts
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name === "dist" ||
        entry.name === "build"
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (ext === ".js" || ext === ".ts" || ext === ".py") {
          const content = await fs.readFile(fullPath, "utf-8");
          // Store relative path to make documentation neat
          const relativePath = path.relative(folderPath, fullPath);
          filesList.push({
            name: entry.name,
            relativePath,
            fullPath,
            content,
            language: ext.slice(1) // 'js', 'ts', 'py'
          });
        }
      }
    }
  }

  await traverse(folderPath);
  return filesList;
}

/**
 * TOOL 2: readGitHubFiles(owner, repo, token, branch)
 * Recursively reads all .js, .ts, .py files from a GitHub repository
 * using Octokit, extracting names and content.
 */
export async function readGitHubFiles(owner, repo, token, branch = "main") {
  const github = new GitHubService(token);
  const filesList = [];

  // Fetch complete repository tree recursively
  const allFiles = await github.listRepoFiles(owner, repo, branch);

  for (const file of allFiles) {
    const ext = path.extname(file.path);
    if (ext === ".js" || ext === ".ts" || ext === ".py") {
      // Split path to inspect directory parts
      const parts = file.path.split(/[/\\]/);
      if (
        parts.includes("node_modules") ||
        parts.includes(".git") ||
        parts.includes("dist") ||
        parts.includes("build")
      ) {
        continue;
      }

      try {
        const fileData = await github.getFileContent(owner, repo, file.path, branch);
        filesList.push({
          name: parts[parts.length - 1],
          relativePath: file.path,
          content: fileData.content,
          language: ext.slice(1) // 'js', 'ts', 'py'
        });
      } catch (err) {
        console.warn(`[CodeParserAgent] Failed to read remote file content for ${file.path}:`, err.message);
      }
    }
  }

  return filesList;
}

/**
 * TOOL 3: parseCodeStructure(fileContent, language)
 * Extracts function signatures, class definitions, exported symbols,
 * and inline comments/JSDoc from code.
 */
export function parseCodeStructure(fileContent, language) {
  const structure = {
    classes: [],
    functions: [],
    exports: [],
    comments: []
  };

  const lines = fileContent.split(/\r?\n/);

  if (language === "py") {
    // 🐍 Python parsing
    let currentDocstring = [];
    let insideDocstring = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle multiline docstrings
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        if (insideDocstring) {
          structure.comments.push(currentDocstring.join("\n"));
          currentDocstring = [];
          insideDocstring = false;
        } else {
          insideDocstring = true;
          const content = trimmed.replace(/^["']{3}/, "").replace(/["']{3}$/, "");
          if (content) currentDocstring.push(content);
        }
        continue;
      }

      if (insideDocstring) {
        currentDocstring.push(line);
        continue;
      }

      // Extract class definitions
      const classMatch = trimmed.match(/^class\s+([a-zA-Z0-9_]+)(?:\(([^)]+)\))?:/);
      if (classMatch) {
        structure.classes.push({
          name: classMatch[1],
          inherits: classMatch[2] || "object",
          line: i + 1
        });
        continue;
      }

      // Extract function definitions
      const funcMatch = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/);
      if (funcMatch) {
        structure.functions.push({
          name: funcMatch[1],
          arguments: funcMatch[2],
          returnType: funcMatch[3] || "void/Any",
          line: i + 1
        });
      }

      // Inline hash comments
      if (trimmed.startsWith("#")) {
        structure.comments.push(trimmed.slice(1).trim());
      }
    }
  } else {
    // 🟨 JS/TS parsing
    let jsdoc = [];
    let insideJsdoc = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // JSDoc detection
      if (trimmed.startsWith("/**")) {
        insideJsdoc = true;
        jsdoc = [trimmed];
        continue;
      }

      if (insideJsdoc) {
        jsdoc.push(line);
        if (trimmed.endsWith("*/")) {
          structure.comments.push(jsdoc.join("\n"));
          insideJsdoc = false;
        }
        continue;
      }

      // Class extractor (e.g. export class MyClass inherits ParentClass)
      const classMatch = trimmed.match(/(?:export\s+)?(?:default\s+)?class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+([a-zA-Z0-9_]+))?/);
      if (classMatch && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
        structure.classes.push({
          name: classMatch[1],
          extends: classMatch[2] || null,
          line: i + 1
        });
        continue;
      }

      // Function extractor
      // 1. Regular functions: function myFunction(arg)
      const funcMatch = trimmed.match(/(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      // 2. Arrow functions assigned to variables: const myFunction = (arg) =>
      const arrowMatch = trimmed.match(/(?:export\s+)?const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);

      if (funcMatch && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
        structure.functions.push({
          name: funcMatch[1],
          arguments: funcMatch[2],
          line: i + 1
        });
      } else if (arrowMatch && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
        structure.functions.push({
          name: arrowMatch[1],
          arguments: arrowMatch[2],
          line: i + 1
        });
      }

      // Export symbol tracking
      if (trimmed.startsWith("export ")) {
        structure.exports.push({
          statement: trimmed,
          line: i + 1
        });
      }
    }
  }

  return structure;
}

/**
 * AGENT LOOP: runCodeParserAgent(options, onStreamCallback)
 * - Reads all files (from either localPath or GitHub repo)
 * - Parses structures
 * - Streams markdown generations from Groq
 * - Saves markdown documents to docs/{filename}.md
 * - Generates docs/README.md linking all files
 */
export async function runCodeParserAgent(options, onStreamCallback = () => {}) {
  let apiKey = process.env.GROQ_API_KEY;
  const isMock = process.env.MOCK_GROQ === "true" || apiKey === "mock";

  if (!apiKey && !isMock) {
    throw new Error("Missing GROQ_API_KEY in active environment config.");
  }
  if (!apiKey) {
    apiKey = "mock";
  }

  let groq;
  if (isMock) {
    groq = {
      chat: {
        completions: {
          create: async function* () {
            yield { choices: [{ delta: { content: "# Mock Documentation\n\nThis is auto-generated mock documentation for verification." } }] };
          }
        }
      }
    };
  } else {
    groq = new Groq({ apiKey });
  }
  
  // Setup output directory using process.cwd() as requested (safe for Linux/cross-platform)
  const docsDir = path.join(process.cwd(), "docs");
  await fs.mkdir(docsDir, { recursive: true });

  let files = [];
  let sourceDescription = "";

  // Support string input (default to local folderPath)
  if (typeof options === "string") {
    options = { folderPath: options };
  }

  if (options.owner && options.repo) {
    const { owner, repo, token, branch = "main", files: targetFiles } = options;
    sourceDescription = `GitHub repository ${owner}/${repo} (branch: ${branch})`;
    
    if (targetFiles && Array.isArray(targetFiles) && targetFiles.length > 0) {
      onStreamCallback({ type: "status", message: `Fetching specific files from ${sourceDescription}: ${targetFiles.join(", ")}...` });
      files = [];
      const github = new GitHubService(token);
      for (const filePath of targetFiles) {
        const ext = path.extname(filePath);
        if (ext === ".js" || ext === ".ts" || ext === ".py") {
          const parts = filePath.split(/[/\\]/);
          if (
            parts.includes("node_modules") ||
            parts.includes(".git") ||
            parts.includes("dist") ||
            parts.includes("build")
          ) {
            continue;
          }
          try {
            const fileData = await github.getFileContent(owner, repo, filePath, branch);
            files.push({
              name: parts[parts.length - 1],
              relativePath: filePath,
              content: fileData.content,
              language: ext.slice(1)
            });
          } catch (err) {
            console.warn(`[CodeParserAgent] Failed to read remote file content for ${filePath}:`, err.message);
          }
        }
      }
    } else {
      onStreamCallback({ type: "status", message: `Fetching remote tree from ${sourceDescription}...` });
      files = await readGitHubFiles(owner, repo, token, branch);
    }
  } else if (options.folderPath) {
    const resolvedPath = path.resolve(options.folderPath);
    sourceDescription = `local folder path: ${resolvedPath}`;
    onStreamCallback({ type: "status", message: `Scanning files inside ${sourceDescription}...` });
    files = await readLocalFiles(resolvedPath);
  } else {
    throw new Error("Invalid parameters. You must supply either a local folderPath or remote owner and repo specifications.");
  }

  if (files.length === 0) {
    onStreamCallback({ type: "status", message: `No compatible code files (.js, .ts, .py) found in target source: ${sourceDescription}` });
    return { success: false, reason: "No target files found" };
  }

  onStreamCallback({ type: "status", message: `Found ${files.length} code files. Starting code structural analysis...` });

  const generatedDocs = [];

  for (const file of files) {
    onStreamCallback({ type: "status", message: `Analyzing code structure in: ${file.relativePath}...` });
    const structure = parseCodeStructure(file.content, file.language);

    onStreamCallback({ type: "status", message: `Streaming technical documentation via Groq Llama3.3 for ${file.name}...` });

    // Build prompting context
    const codeContext = JSON.stringify(structure, null, 2);
    
    // Create streaming connection with Groq
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 3000,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `You are a technical documentation expert. Given the following code structure from a file, generate comprehensive Markdown documentation including: Overview, Functions/Methods (with parameters, return types, description), Classes, Usage Examples, and any important notes. Be concise but complete.`
        },
        {
          role: "user",
          content: `Here is the code structure extracted from '${file.relativePath}' (language: ${file.language}):
          
\`\`\`json
${codeContext}
\`\`\`

Please generate the technical documentation.`
        }
      ],
      stream: true
    });

    let fileDocMarkdown = "";
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        fileDocMarkdown += text;
        onStreamCallback({
          type: "stream",
          file: file.relativePath,
          text
        });
      }
    }

    // Save to docs/{filename}.md (or handle nested names by flattening/slugifying)
    const docFilename = `${file.relativePath.replace(/[/\\]/g, "_")}.md`;
    const docFullPath = path.join(docsDir, docFilename);
    
    await fs.writeFile(docFullPath, fileDocMarkdown, "utf-8");
    onStreamCallback({ type: "status", message: `Saved technical documentation to docs/${docFilename}` });

    if (options.owner && options.repo) {
      const github = new GitHubService(options.token);
      const gitPath = `docs/${docFilename}`;
      onStreamCallback({ type: "status", message: `Committing docs/${docFilename} to GitHub repository...` });
      await github.createOrUpdateFile(
        options.token,
        options.owner,
        options.repo,
        gitPath,
        fileDocMarkdown,
        `docs: update technical specifications for ${file.relativePath}`,
        options.branch || "main"
      );
    }

    generatedDocs.push({
      originalPath: file.relativePath,
      docFilename,
      docFullPath,
      title: file.name
    });
  }

  // Create docs/README.md table of contents
  onStreamCallback({ type: "status", message: "Generating parent Table of Contents README.md..." });
  
  let readmeContent = `# 📚 Repository Technical Reference Manual
 
Welcome to the auto-generated documentation manual. The files listed below have been parsed, structured, and compiled by the **CodeParserAgent**.
 
## 📁 Technical Documents Index
 
| Code File Path | Document Name | Technical Specifications Link |
| :--- | :--- | :--- |
`;

  for (const doc of generatedDocs) {
    readmeContent += `| \`${doc.originalPath}\` | ${doc.title} Specifications | [${doc.docFilename}](./${doc.docFilename}) |\n`;
  }

  readmeContent += `\n\n*Generated automatically on ${new Date().toLocaleDateString()} using Agentic SDK and Groq Llama 3.3.*`;

  const readmePath = path.join(docsDir, "README.md");
  await fs.writeFile(readmePath, readmeContent, "utf-8");

  if (options.owner && options.repo) {
    const github = new GitHubService(options.token);
    const gitPath = `docs/README.md`;
    onStreamCallback({ type: "status", message: `Committing docs/README.md index to GitHub repository...` });
    await github.createOrUpdateFile(
      options.token,
      options.owner,
      options.repo,
      gitPath,
      readmeContent,
      `docs: update repository technical reference manual index`,
      options.branch || "main"
    );
  }

  onStreamCallback({ type: "status", message: "Documentation compilation finished successfully!" });

  return {
    success: true,
    docsDir,
    docsGeneratedCount: generatedDocs.length
  };
}
