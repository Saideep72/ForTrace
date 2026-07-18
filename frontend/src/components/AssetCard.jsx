import React from 'react';
import { getUserRole } from '../utils';

export function AssetGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}

export default function AssetCard({ id, tag, type, plant, status = 'Running', health = 100, image }) {
  const statusColor =
    status === 'Running' ? '#22c55e' :
    status === 'Warning' ? '#f59e0b' :
    status === 'Critical' ? '#ef4444' : '#94a3b8';

  return (
    <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(39,97,82,0.2)] group">
      <div className="h-40 relative overflow-hidden bg-[var(--c-bg)]">
        {image && (
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${image})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full text-gray-800">
          {plant || 'Plant Alpha'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-[var(--c-text)] leading-tight">{tag || id}</h3>
        <p className="text-sm text-[var(--c-text-secondary)] mb-4">{type || 'Equipment'}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
            <span className="text-sm font-bold" style={{ color: statusColor }}>{status}</span>
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)' }}>
            Health: {health}%
          </p>
        </div>
      </div>
    </div>
  );
}
