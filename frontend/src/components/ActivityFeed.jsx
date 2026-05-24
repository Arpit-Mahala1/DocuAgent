import React from 'react';

const ActivityFeed = ({ logs }) => {
  return (
    <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-sm max-h-[36rem] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Agent Activity Feed</h3>
        <span className="text-xs text-[var(--color-text-muted)]">Polling every 3s</span>
      </div>
      {logs.length === 0 ? (
        <div className="text-[var(--color-text-muted)]">No activity yet. Trigger a generation to see live agent logs.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id || `${log.agent}-${log.timestamp}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-text-muted)]">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="rounded-full bg-[var(--color-surface)] px-2 py-1 text-[var(--color-text-muted)]">{log.agent}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-primary)]">{log.message || log.action || 'Agent activity in progress.'}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[var(--color-text-muted)] text-xs">
                {log.status && <span className="rounded-full bg-[var(--color-surface)] px-2 py-1">{log.status}</span>}
                {log.trigger && <span className="rounded-full bg-[var(--color-surface)] px-2 py-1">{log.trigger}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
