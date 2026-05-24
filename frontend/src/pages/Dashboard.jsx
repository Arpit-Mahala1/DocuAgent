import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import RepoCard from '../components/RepoCard.jsx';
import RepoSelector from '../components/RepoSelector.jsx';
import toast from 'react-hot-toast';
import Logo from '../components/Logo.jsx';

import ActivityFeed from '../components/ActivityFeed.jsx';

const Dashboard = () => {
  const { user, token, repos, setRepos, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [allRepos, setAllRepos] = useState([]);

  /**
   * Fetch latest repo list from /api/repos which correctly decorates
   * each repo with { connected, status, lastDocUpdate }.
   * Falls back to /auth/session if /api/repos fails.
   */
  const refreshRepos = async () => {
    try {
      const res = await apiClient.get('/api/repos');
      const fetched = res.data.repos || [];
      setRepos(fetched);
      setAllRepos(fetched);
    } catch (error) {
      console.error('refreshRepos /api/repos failed:', error);
      try {
        const res = await apiClient.get('/auth/session');
        const fetched = res.data.repos || [];
        setRepos(fetched);
        setAllRepos(fetched);
      } catch (fallback) {
        console.error('refreshRepos /auth/session fallback failed:', fallback);
        if (fallback?.response?.status !== 401) {
          toast.error('Failed to refresh repos');
        }
      }
    }
  };

  // On mount: seed from context if already populated, otherwise fetch
  useEffect(() => {
    if (!token) return;
    if (repos.length > 0) {
      setAllRepos(repos);
    } else {
      refreshRepos();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        const res = await apiClient.get('/api/agent-logs');
        setAgentLogs(res.data.logs || []);
      } catch (err) {
        console.error('Agent log polling failed:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [token]);

  const handleConnectRepo = async (owner, repo) => {
    setLoading(true);
    try {
      await apiClient.post('/api/connect-repo', { owner, repo });
      // Refresh so the card immediately shows "Connected" status
      await refreshRepos();
      toast.success(`Connected ${owner}/${repo}`);
      setShowRepoSelector(false);
    } catch (err) {
      console.error('Connect repo failed:', err);
      if (err?.response?.status === 401) {
        toast.error('Session expired — please log in again.');
      } else {
        toast.error('Failed to connect repo');
      }
    } finally {
      setLoading(false);
    }
  };

  const connectedRepos = repos.filter((r) => r.connected);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] page-transition">
      <nav className="flex items-center justify-between p-4 bg-[var(--color-surface)] shadow-md">
        <Link to="/"><Logo /></Link>
        <div className="flex items-center space-x-3">
          {user && (
            <>
              <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
              <span className="text-sm">{user.login}</span>
            </>
          )}
          <button
            onClick={logout}
            className="px-3 py-1 text-sm rounded bg-[var(--color-surface-hover,#333)] hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Connected Repositories</h2>
                <p className="text-[var(--color-text-muted)] mt-1">
                  Manage documentation generation for your connected projects.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRepoSelector((prev) => !prev)}
                className="px-5 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg shadow-glow transition-all"
              >
                {showRepoSelector ? 'Hide Repository List' : 'Add Repository'}
              </button>
            </div>

            {/* Connected repo cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedRepos.length > 0 ? (
                connectedRepos.map((r) => (
                  <RepoCard key={r.id} repo={r} onConnect={handleConnectRepo} loading={loading} />
                ))
              ) : (
                <div className="rounded-xl bg-[var(--color-surface)] p-6 text-[var(--color-text-muted)]">
                  No connected repositories yet. Click "Add Repository" to connect one.
                </div>
              )}
            </div>

            {/* Repo selector dropdown */}
            {showRepoSelector && (
              <section className="mt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Your GitHub Repos{' '}
                  <span className="text-sm font-normal text-[var(--color-text-muted)]">
                    ({allRepos.length} found)
                  </span>
                </h3>
                {allRepos.length === 0 ? (
                  <p className="text-[var(--color-text-muted)]">No repositories found.</p>
                ) : (
                  <RepoSelector
                    repos={allRepos}
                    onSelect={handleConnectRepo}
                    loading={loading}
                  />
                )}
              </section>
            )}
          </div>

          <aside className="mt-8 xl:mt-0 xl:w-[28rem]">
            <ActivityFeed logs={agentLogs} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
