import React from 'react';
import { Shield, Activity } from 'lucide-react';
import { getUserRole } from '../utils';

export default function RBACBadge() {
  const role = getUserRole() || 'Unknown';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'transparent', padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid #b1b7ab' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRight: '1px solid #b1b7ab', paddingRight: '0.75rem' }}>
        <Shield size={14} color="#0d3a35" />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d3a35', letterSpacing: '0.02em' }}>
          {role.replace('_', ' ')}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRight: '1px solid #b1b7ab', paddingRight: '0.75rem' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#276152', boxShadow: '0 0 6px #276152' }}></span>
        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#0d3a35', textTransform: 'uppercase' }}>Shift Active</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Activity size={14} color="#276152" />
        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#0d3a35', textTransform: 'uppercase' }}>Sys: OK</span>
      </div>
    </div>
  );
}
