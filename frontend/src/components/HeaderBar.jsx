import React from 'react';
import { Search, Bell, Sun, User, Building2 } from 'lucide-react';

export default function HeaderBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '1.5rem', position: 'sticky', top: 0, zIndex: 50, pointerEvents: 'none' }}>
      <header style={{ 
        width: '100%',
        maxWidth: '1200px',
        height: '60px',
        background: 'transparent',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--c-border)',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        pointerEvents: 'auto'
      }}>
        <div style={{ flex: 1 }}></div>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            style={{ 
              padding: '0.5rem 1rem 0.5rem 2.8rem',
              background: 'rgba(0,0,0,0.03)',
              border: 'none',
              borderRadius: '9999px',
              color: 'var(--c-text)',
              fontSize: '0.85rem',
              width: '240px',
              outline: 'none'
            }}
          />
        </div>

        <div className="actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', padding: '0.4rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--c-border)' }}>
            <Building2 size={16} color="var(--c-text-secondary)" />
            <span style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '0.8rem' }}>Plant A</span>
          </div>
          
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-text-secondary)', display: 'flex', padding: '0.4rem' }}>
            <Sun size={18} />
          </button>
          
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-text-secondary)', display: 'flex', padding: '0.4rem' }}>
            <Bell size={18} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.2rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c-primary), var(--c-secondary))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
              A
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
