import React, { useState, useEffect } from 'react';

// Searchable dropdown for user's GitHub repos
// Props: repos (array of {owner, name, description}), onSelect(owner, repo), loading

const RepoSelector = ({ repos, onSelect, loading }) => {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    setFiltered(
      repos.filter((r) =>
        `${r.owner}/${r.name}`.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, repos]);

  const handleSelect = (repo) => {
    if (loading) return;
    // ✅ FIXED: removed the duplicate toast.success here.
    // Dashboard's handleConnectRepo already shows "Connected owner/repo"
    // after the API call succeeds. Showing one here too caused the double toast.
    onSelect(repo.owner, repo.name);
    setQuery(''); // close the dropdown after selection
  };

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        placeholder="Search repos…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 rounded bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />
      {query && (
        <ul className="mt-2 max-h-60 overflow-y-auto bg-[var(--color-surface)] rounded shadow-md">
          {filtered.length > 0 ? (
            filtered.map((repo) => (
              <li
                key={`${repo.owner}/${repo.name}`}
                className={`px-4 py-2 cursor-pointer hover:bg-[var(--color-primary)] hover:text-white ${
                  loading ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => handleSelect(repo)}
              >
                {repo.owner}/{repo.name}
                {repo.connected && (
                  <span className="ml-2 text-xs text-green-400">● Connected</span>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default RepoSelector;
