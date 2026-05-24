import React from 'react';
import { useNavigate } from 'react-router-dom';

const RepoCard = ({ repo, onConnect, loading }) => {
  const navigate = useNavigate();
  const isConnected = repo.connected;
  const lastUpdated = repo.lastDocUpdate || repo.lastUpdatedAt || repo.docLastUpdatedAt;
  const statusText = repo.status || (isConnected ? (lastUpdated ? 'Docs up to date' : 'Connected') : 'Not Connected');
  const statusColor = repo.status?.toLowerCase().includes('error')
    ? 'bg-red-600'
    : isConnected
    ? 'bg-green-600'
    : 'bg-gray-600';

  const handleViewDocs = () => {
    navigate(`/docs/${repo.owner}/${repo.name}`);
  };

  const handleConnect = () => {
    if (loading) return;
    onConnect(repo.owner, repo.name);
  };

  return (
    <div className="p-4 glass-card flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold mb-2">{repo.name}</h3>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          {lastUpdated ? `Docs updated ${new Date(lastUpdated).toLocaleString()}` : 'Docs not generated yet'}
        </p>
        <p className="text-sm mb-4">{repo.description || 'No description available.'}</p>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={isConnected ? handleViewDocs : handleConnect}
          disabled={loading}
          className="w-full px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded disabled:opacity-50"
        >
          {isConnected ? 'View Docs' : loading ? 'Connecting…' : 'Connect Repo'}
        </button>
        <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded ${statusColor}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default RepoCard;
