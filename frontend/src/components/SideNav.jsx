import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  FileText, 
  Network, 
  Bot, 
  ShieldCheck, 
  BarChart2, 
  Settings 
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assets', label: 'Assets', icon: Box },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function SideNav({ activeTab, setActiveTab, isCollapsed, onToggleSidebar }) {
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div 
        onClick={onToggleSidebar} 
        className="sidebar-logo"
        title="Toggle Sidebar"
      >
        <span className="logo-icon">F</span>
        <span className="nav-label" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--c-text)', whiteSpace: 'nowrap' }}>
          ort<span style={{ color: 'var(--c-text)' }}>Trace</span>
        </span>
      </div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              if (setActiveTab) setActiveTab(item.id);
              if (item.id === 'dashboard' || item.id === 'assets' || item.id === 'documents') {
                navigate(`/${item.id}`);
              }
            }}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
