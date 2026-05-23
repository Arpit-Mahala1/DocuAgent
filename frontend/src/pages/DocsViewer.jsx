import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import DocsSidebar from '../components/DocsSidebar.jsx';
import MarkdownViewer from '../components/MarkdownViewer.jsx';
import toast from 'react-hot-toast';

const DocsViewer = () => {
  const { owner, repo } = useParams();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [logs, setLogs] = useState([]);

  // Fetch list of markdown files
  useEffect(() => {
    apiClient
      .get(`/api/docs/${owner}/${repo}`)
      .then((res) => setFiles(res.data.files || []))
      .catch(() => toast.error('Failed to load doc list'));
  }, [owner, repo]);

  // Fetch selected file content
  useEffect(() => {
    if (!selectedFile) return;
    setLoadingFile(true);
    apiClient
      .get(`/api/docs/${owner}/${repo}/${selectedFile}`)
      .then((res) => setContent(res.data.content || ''))
      .finally(() => setLoadingFile(false));
  }, [owner, repo, selectedFile]);

  // Poll agent logs every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      apiClient
        .get('/api/agent-logs')
        .then((res) => setLogs(res.data.logs || []))
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRegenerate = async () => {
    setLoadingDocs(true);
    try {
      await apiClient.post('/api/docs/parse', { owner, repo });
      toast.success('Documentation generation started');
    } catch (err) {
      toast.error('Failed to start generation');
    } finally {
      setLoadingDocs(false);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <aside className="w-64 bg-[var(--color-surface)] p-4 overflow-y-auto hidden md:block">
        <DocsSidebar files={files} onSelect={setSelectedFile} selected={selectedFile} />
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 bg-[var(--color-surface)] shadow-md">
          <h2 className="text-xl font-semibold">{owner}/{repo} Documentation</h2>
          <button
            onClick={handleRegenerate}
            disabled={loadingDocs}
            className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded disabled:opacity-50"
          >
            {loadingDocs ? 'Generating…' : 'Regenerate Docs'}
          </button>
        </header>
        <section className="flex-1 overflow-y-auto p-4">
          {loadingFile ? (
            <div className="flex justify-center items-center h-full">
              <div className="loader border-t-4 border-b-4 border-[var(--color-primary)] rounded-full w-12 h-12 animate-spin" />
            </div>
          ) : (
            <MarkdownViewer markdown={content} />
          )}
        </section>
        <footer className="h-32 overflow-y-auto p-2 bg-[var(--color-surface)] text-sm">
          <h3 className="font-medium mb-1">Agent Logs (latest 50)</h3>
          <ul>
            {logs.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        </footer>
      </main>
    </div>
  );
};

export default DocsViewer;
