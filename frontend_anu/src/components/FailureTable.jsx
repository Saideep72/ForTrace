import React from 'react';

export default function FailureTable({ rows = [] }) {
  return (
    <div className="card">
      <div className="card-body">
        <h2 className="section-label">Failure History</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>ASSET</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>FAILURE MODE</th>
              <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                <td style={{ padding: '0.85rem 0', fontSize: '0.85rem', fontWeight: 500, color: 'var(--c-text)' }}>{row.asset}</td>
                <td style={{ padding: '0.85rem 0', fontSize: '0.85rem', color: 'var(--c-text-secondary)' }}>{row.mode}</td>
                <td style={{ padding: '0.85rem 0', fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
