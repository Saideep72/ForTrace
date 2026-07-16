import React from 'react';

export default function AssetCard({ id, status = 'Running', health = 100 }) {
  const statusClass =
    status === 'Running' ? 'badge-success' :
    status === 'Warning' ? 'badge-warning' :
    status === 'Critical' ? 'badge-danger' : 'badge-offline';

  return (
    <div className="kpi-card">
      <div className="kpi-label">{id}</div>
      <span className={`badge ${statusClass}`}>
        <span className="badge-dot"></span>
        {status}
      </span>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)', marginTop: '0.5rem' }}>
        Health: {health}%
      </p>
    </div>
  );
}
