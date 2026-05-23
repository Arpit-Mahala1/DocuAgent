import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import apiClient from '../api/apiClient.js';
import RepoCard from '../components/RepoCard.jsx';
import RepoSelector from '../components/RepoSelector.jsx';
import toast from 'react-hot-toast';
import Logo from '../components/Logo.jsx';

const Dashboard = () => {
  const { user, token, repos, setRepos } = useContext(AuthContext);
  const [availableRepos, setAvailableRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's GitHub repos for the selector (only once)
  useEffect(() => {
    if (token) {
      apiClient
        .get('/auth/session', { params: { token } }) // reuse endpoint returns repos
        .then((res) => setAvailableRepos(res.data.repos))
        .catch(() => toast.error('Failed to fetch GitHub repos'));
    }
  }, [token]);

  const handleConnectRepo = async (owner, repo) => {
    if (!token) return toast.error('Not authenticated');
    setLoading(true);
    try {
      await apiClient.post('/api/connect-repo', { owner, repo, token });
      toast.success(`Connected ${owner}/${repo}`);
      // Refresh connected repos list
      const res = await apiClient.get('/auth/session', { params: { token } });
      setRepos(res.data.repos);
    } catch (err) {
      toast.error('Failed to connect repo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <nav className="flex items-center justify-between p-4 bg-[var(--color-surface)] shadow-md">
        <Logo />
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
              <span>{user.login}</span>
            </div>
          )}
        </div>
      </nav>
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Connected Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos && repos.length > 0 ? (
            repos.map((r) => (
              <RepoCard key={r.id} repo={r} onConnect={handleConnectRepo} loading={loading} />
            ))
          ) : (
            <p>No repositories connected yet.</p>
          )}
        </div>
        <section className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Add Repository</h3>
          <RepoSelector
            repos={availableRepos}
            onSelect={(owner, repo) => handleConnectRepo(owner, repo)}
            loading={loading}
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
