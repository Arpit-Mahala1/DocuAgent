import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import DocsSidebar from '../components/DocsSidebar.jsx';
import MarkdownViewer from '../components/MarkdownViewer.jsx';
import { BackButton } from '../components/BackButton.jsx';
import toast from 'react-hot-toast';
import { DEMO_DOCS_LIST, DEMO_REPO_FILES, DEMO_DOCS_CONTENT, DEMO_OWNER, DEMO_REPO } from '../context/DemoMode.js';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Convert a flat list of paths into a nested tree object */
function buildTree(paths) {
  const root = {};
  for (const path of paths) {
    const parts = path.split('/');
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // leaf = file
        node[part] = null;
      } else {
        if (!node[part] || node[part] === null) node[part] = {};
        node = node[part];
      }
    }
  }
  return root;
}

/** Get a simple file-extension icon */
function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    js: '🟨', jsx: '🟨', ts: '🔷', tsx: '🔷',
    json: '📋', md: '📝', css: '🎨', html: '🌐',
    py: '🐍', sh: '⚙️', yml: '⚙️', yaml: '⚙️',
    env: '🔒', gitignore: '👁️', lock: '🔒',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', svg: '🖼️', ico: '🖼️',
  };
  return map[ext] || '📄';
}

/** Recursive tree node component */
const TreeNode = ({ name, node, depth = 0 }) => {
  const isFolder = node !== null && typeof node === 'object';
  const [open, setOpen] = useState(depth < 2); // top two levels open by default

  const indent = depth * 14;

  if (!isFolder) {
    return (
      <div
        style={{ paddingLeft: indent + 20 }}
        className="flex items-center gap-1.5 py-0.5 pr-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded cursor-default select-none"
      >
        <span>{fileIcon(name)}</span>
        <span className="truncate">{name}</span>
      </div>
    );
  }

  const children = Object.entries(node).sort(([aName, aVal], [bName, bVal]) => {
    // folders first, then files, both alphabetical
    const aIsFolder = aVal !== null && typeof aVal === 'object';
    const bIsFolder = bVal !== null && typeof bVal === 'object';
    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
    return aName.localeCompare(bName);
  });

  return (
    <div>
      <div
        style={{ paddingLeft: indent }}
        className="flex items-center gap-1.5 py-0.5 pr-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-xs text-[var(--color-text-muted)] w-3 text-center">{open ? '▾' : '▸'}</span>
        <span>📁</span>
        <span className="truncate">{name}</span>
      </div>
      {open && (
        <div>
          {children.map(([childName, childNode]) => (
            <TreeNode key={childName} name={childName} node={childNode} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

/** Full file tree rendered from a flat path list */
const FileTree = ({ paths }) => {
  const tree = buildTree(paths);
  const entries = Object.entries(tree).sort(([aName, aVal], [bName, bVal]) => {
    const aIsFolder = aVal !== null && typeof aVal === 'object';
    const bIsFolder = bVal !== null && typeof bVal === 'object';
    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
    return aName.localeCompare(bName);
  });

  return (
    <div className="text-sm font-mono">
      {entries.map(([name, node]) => (
        <TreeNode key={name} name={name} node={node} depth={0} />
      ))}
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const DocsViewer = (props) => {
  const { owner: paramOwner, repo: paramRepo } = useParams();
  const location = useLocation();
  const isDemoMode = location.pathname === '/demo';
  
  // Use demo data if in demo mode, otherwise use URL params
  const owner = isDemoMode ? DEMO_OWNER : paramOwner;
  const repo = isDemoMode ? DEMO_REPO : paramRepo;
  
  const [files, setFiles] = useState([]);
  const [repoFiles, setRepoFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);

  const readingTime = useMemo(() => {
    if (!content) return 0;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [content]);
  const [loadingApiDocs, setLoadingApiDocs] = useState(false);
  const [loadingPRSummary, setLoadingPRSummary] = useState(false);
  const [loadingChangelog, setLoadingChangelog] = useState(false);
  const [prNumber, setPrNumber] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const [logs, setLogs] = useState([]);
  const [statusMessage, setStatusMessage] = useState(isDemoMode ? '🎪 Demo Mode — No authentication required' : 'Ready to regenerate docs.');
  const [activeTab, setActiveTab] = useState('docs');

  // Load demo data on mount if in demo mode
  useEffect(() => {
    if (isDemoMode) {
      setFiles(DEMO_DOCS_LIST);
      setRepoFiles(DEMO_REPO_FILES);
      setSelectedFile(DEMO_DOCS_LIST[0]);
      setStatusMessage('🎪 Demo Mode — Explore pre-generated documentation');
      return;
    }

    // Otherwise load from API
    setLoadingTree(true);
    apiClient
      .get(`/api/repo/${owner}/${repo}/tree`)
      .then((res) => {
        const raw = res.data.files || [];
        setRepoFiles(raw.map((f) => (typeof f === 'object' && f !== null ? f.path : f)));
      })
      .catch(() => toast.error('Failed to load repository file tree'))
      .finally(() => setLoadingTree(false));

    apiClient
      .get(`/api/docs/${owner}/${repo}`)
      .then((res) => {
        const docs = res.data.files || [];
        setFiles(docs);
        if (docs.length > 0 && !selectedFile) {
          setSelectedFile(docs[0]);
        }
      })
      .catch(() => toast.error('Failed to load docs list'));
  }, [owner, repo, isDemoMode]);

  // Load file content
  useEffect(() => {
    if (!selectedFile) { 
      setContent(''); 
      return; 
    }
    
    if (isDemoMode) {
      setContent(DEMO_DOCS_CONTENT[selectedFile] || '');
      return;
    }

    setLoadingFile(true);
    apiClient
      .get(`/api/docs/${owner}/${repo}/${selectedFile}`)
      .then((res) => setContent(res.data.content || ''))
      .catch(() => toast.error('Failed to load file content'))
      .finally(() => setLoadingFile(false));
  }, [owner, repo, selectedFile, isDemoMode]);

  // Poll agent logs (not in demo mode)
  useEffect(() => {
    if (isDemoMode) return;
    
    const interval = setInterval(() => {
      apiClient.get('/api/agent-logs').then((res) => setLogs(res.data.logs || [])).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  useEffect(() => {
    if (loadingDocs) setStatusMessage('Generating documentation...');
    else if (isDemoMode) setStatusMessage('🎪 Demo Mode — Explore pre-generated documentation');
    else if (logs.length > 0) setStatusMessage('Recent generation activity available below.');
    else if (files.length > 0) setStatusMessage('Docs are up to date for the selected repository.');
    else setStatusMessage('No generated docs found yet.');
  }, [loadingDocs, logs, files, isDemoMode]);

  const handleRegenerate = async () => {
    if (isDemoMode) {
      toast.error('Cannot regenerate docs in demo mode. Connect a real repository to generate docs.');
      return;
    }
    
    setLoadingDocs(true);
    setStatusMessage('Triggering generation...');
    try {
      await apiClient.post('/api/generate', { owner, repo });
      toast.success('Documentation generation started');
    } catch (err) {
      toast.error('Failed to start generation');
      setStatusMessage('Failed to trigger generation.');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleGenerateApiDocs = async () => {
    if (isDemoMode) {
      toast.error('Cannot regenerate docs in demo mode. Connect a real repository to generate docs.');
      return;
    }
    
    setLoadingApiDocs(true);
    setStatusMessage('Triggering API docs generation...');
    try {
      await apiClient.post('/api/docs/api-reference', { owner, repo });
      toast.success('API docs generation started');
    } catch (err) {
      toast.error('Failed to start API docs generation');
      setStatusMessage('Failed to trigger API docs generation.');
    } finally {
      setLoadingApiDocs(false);
    }
  };

  const handleSummarizePr = async () => {
    if (isDemoMode) {
      toast.error('Cannot summarize PRs in demo mode. Connect a real repository to test PR features.');
      return;
    }
    
    if (!prNumber.trim()) {
      toast.error('Enter a PR number first');
      return;
    }
    setLoadingPRSummary(true);
    setStatusMessage('Triggering PR summary generation...');
    try {
      await apiClient.post('/api/docs/pr-summary', { owner, repo, prNumber: prNumber.trim() });
      toast.success('PR summary generation started');
    } catch (err) {
      toast.error('Failed to start PR summary');
      setStatusMessage('Failed to trigger PR summary.');
    } finally {
      setLoadingPRSummary(false);
    }
  };

  const handleUpdateChangelog = async () => {
    if (isDemoMode) {
      toast.error('Cannot update changelog in demo mode. Connect a real repository to generate changelogs.');
      return;
    }
    
    setLoadingChangelog(true);
    setStatusMessage('Triggering changelog update...');
    try {
      await apiClient.post('/api/docs/changelog', { owner, repo });
      toast.success('Changelog update started');
    } catch (err) {
      toast.error('Failed to start changelog update');
      setStatusMessage('Failed to trigger changelog update.');
    } finally {
      setLoadingChangelog(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/docs/${owner}/${repo}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <header className="p-4 bg-[var(--color-surface)] shadow-md">
        <BackButton to="/dashboard" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">{owner}/{repo}</h2>
              {isDemoMode && <span className="text-xs px-2 py-1 bg-[var(--color-primary)] text-white rounded-full">DEMO</span>}
            </div>
            <p className="mt-1 text-[var(--color-text-muted)]">{statusMessage}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 rounded ${activeTab === 'docs' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'}`}
            >
              Docs Preview
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 rounded ${activeTab === 'files' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'}`}
            >
              Repo File Tree
            </button>
            {!isDemoMode && (
              <>
                <button
                  onClick={handleRegenerate}
                  disabled={loadingDocs}
                  className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded disabled:opacity-50"
                >
                  {loadingDocs ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 rounded-full border border-[var(--color-surface)] border-t-[var(--color-primary)] animate-spin" />
                      Generating…
                    </>
                  ) : 'Regenerate Docs'}
                </button>
                <button
                  onClick={handleGenerateApiDocs}
                  disabled={loadingApiDocs}
                  className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded disabled:opacity-50"
                >
                  {loadingApiDocs ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 rounded-full border border-[var(--color-surface)] border-t-[var(--color-primary)] animate-spin" />
                      Generating API Docs…
                    </>
                  ) : 'Generate API Docs'}
                </button>
                <button
                  onClick={handleUpdateChangelog}
                  disabled={loadingChangelog}
                  className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded disabled:opacity-50"
                >
                  {loadingChangelog ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 rounded-full border border-[var(--color-surface)] border-t-[var(--color-primary)] animate-spin" />
                      Updating Changelog…
                    </>
                  ) : 'Update Changelog'}
                </button>
              </>
            )}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] rounded border border-[var(--color-border)]"
              title="Copy docs link to clipboard"
            >
              📋 Copy Link
            </button>
          </div>
        </div>
        {!isDemoMode && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="pr-number"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
              placeholder="PR number"
              className="w-full rounded bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <button
              onClick={handleSummarizePr}
              disabled={loadingPRSummary}
              className="inline-flex min-w-[10rem] items-center justify-center rounded bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
                {loadingPRSummary ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 rounded-full border border-[var(--color-surface)] border-t-[var(--color-primary)] animate-spin" />
                    Summarizing PR…
                  </>
                ) : 'Summarize PR'}
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-80 flex-col gap-4 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-y-auto md:flex">
          <div>
            <h3 className="text-lg font-semibold mb-3">Generated docs</h3>
            {files.length > 0 ? (
              <DocsSidebar files={files} onSelect={setSelectedFile} selected={selectedFile} />
            ) : (
              <p className="text-[var(--color-text-muted)]">No docs found yet. Regenerate to create docs.</p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Repository files</h3>
            {loadingTree ? (
              <p className="text-[var(--color-text-muted)]">Loading file tree…</p>
            ) : repoFiles.length > 0 ? (
              <div className="max-h-[40vh] overflow-y-auto">
                <FileTree paths={repoFiles} />
              </div>
            ) : (
              <p className="text-[var(--color-text-muted)]">No repo files available.</p>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4">
          {activeTab === 'docs' ? (
            <div className="space-y-4">
              <div className="md:hidden">
                <label className="block mb-2 text-sm font-medium">Choose doc file</label>
                <select
                  value={selectedFile || ''}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full rounded bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text-primary)]"
                >
                  {files.length === 0 ? (
                    <option value="">No docs available</option>
                  ) : (
                    files.map((file) => (
                      <option key={file} value={file}>{file}</option>
                    ))
                  )}
                </select>
              </div>
              <div className="rounded-xl bg-[#0b0b0b] border border-[#222222] p-4 shadow-sm">
                {loadingFile ? (
                  <div className="flex h-72 items-center justify-center">
                    <div className="loader" />
                  </div>
                ) : content ? (
                  <>
                    <div className="mb-4 text-sm text-[#888888]">{readingTime} min read</div>
                    <MarkdownViewer markdown={content} />
                  </>
                ) : (
                  <p className="text-[var(--color-text-muted)]">Select a generated doc file to preview its contents.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <section className="rounded-xl bg-[var(--color-surface)] p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-3">
                  Repository file tree
                  {repoFiles.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
                      ({repoFiles.length} files)
                    </span>
                  )}
                </h3>
                {loadingTree ? (
                  <p className="text-[var(--color-text-muted)]">Loading repo file tree…</p>
                ) : repoFiles.length > 0 ? (
                  <div className="overflow-y-auto max-h-[70vh]">
                    <FileTree paths={repoFiles} />
                  </div>
                ) : (
                  <p className="text-[var(--color-text-muted)]">No repository files available.</p>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {!isDemoMode && (
        <footer className="bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
          <h3 className="font-semibold mb-2">Live generation output</h3>
          <div className="space-y-2">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                  <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
                    <span>{log.trigger}</span>
                    <span>{log.status}</span>
                  </div>
                  <div className="mt-2 text-sm text-[var(--color-text-primary)]">
                    {log.output?.error ? <span className="text-rose-400">{log.output.error}</span> : <span>Completed at {log.endTime || 'pending'}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div>Awaiting generation output...</div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default DocsViewer;


