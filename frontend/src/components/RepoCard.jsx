import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient.js';

const RepoCard = ({ repo, onConnect, loading }) => {
  const navigate = useNavigate();
  const isConnected = repo.connected; // assuming API provides this flag

  const handleViewDocs = () => {
    navigate(`/docs/${repo.owner}/${repo.name}`);
  };

  const handleConnect = () => {
    if (loading) return;
    onConnect(repo.owner, repo.name);
  };

  return (
    <div className="p-4 glass-card flex flex-col justify-between h-full">
      <h3 className="text-lg font-semibold mb-2">{repo.name}</h3>
      <p className="text-sm mb-4">{repo.description || 'No description'}</p>
      <div className="mt-auto flex space-x-2">
        {isConnected ? (
          <button
            onClick={handleViewDocs}
            className="flex-1 px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded"
          >
            View Docs
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded disabled:opacity-50"
          >
            {loading ? 'Connecting…' : 'Connect Repo'}
          </button>
        )}
        <span className={`px-2 py-1 text-xs font-medium rounded ${isConnected ? 'bg-green-600' : 'bg-gray-600'}`}> 
          {isConnected ? 'Connected' : 'Not Connected'}
        </span>
      </div>
    </div>
  );
};

export default RepoCard;
