import React from 'react';
import { Search, Sun, Moon, User, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard' },
  { id: 'operations', path: '/operations', label: 'Operations Center' },
  { id: 'network', path: '/network', label: 'Network Graph' },
  { id: 'ai', path: '/ai', label: 'AI Assistant' },
  { id: 'settings', path: '/settings', label: 'Settings' },
];

export default function HeaderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '1.5rem', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
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
        padding: '0 1.5rem',
        pointerEvents: 'auto'
      }}>
        {/* Center Nav Links in the remaining space */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                  color: isActive ? 'var(--c-primary)' : 'var(--c-text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--c-text)';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--c-text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', padding: '0.4rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--c-border)' }}>
            <Building2 size={16} color="var(--c-text-secondary)" />
            <span style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '0.8rem' }}>Plant A</span>
          </div>
          
          <button 
            onClick={handleThemeToggle}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-text-secondary)', display: 'flex', padding: '0.4rem' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div 
            onClick={() => navigate('/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.2rem' }}
            title="Settings"
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c-primary), var(--c-secondary))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
              A
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
