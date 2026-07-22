import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, LogOut, User, LogIn } from 'lucide-react';
import { getUserRole, hasAccess, handleLogout } from '../utils';

const NAV_ITEMS = [
  { id: 'home', path: '/home', label: 'Home', viewName: 'Dashboard' },
  { id: 'documents', path: '/documents', label: 'Documents Dashboard', viewName: 'Documents Dashboard' },
  { id: 'ai', path: '/ai', label: 'AI Agent Chat', viewName: 'AI Agent Chat' },
  { id: 'network', path: '/network', label: 'Network Analysis', viewName: 'Network Analysis' },
  { id: 'reports', path: '/reports', label: 'Reports & Audit', viewName: 'Reports & Audit' },
  { id: 'expert', path: '/expert-advice', label: 'Expert Advice', viewName: 'Expert Advice' }
];

export default function HeaderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();
  const userEmail = localStorage.getItem('user_email') || 'Operator';

  const roleLabels = {
    'Plant_Manager': 'Plant Manager',
    'Field_Technician': 'Field Technician',
    'Quality_Engineer': 'Quality Engineer',
    'Maintenance_Engineer': 'Maintenance Engineer',
    'Safety_Officer': 'Safety Officer',
    'Auditor': 'Auditor',
    'Admin': 'System Administrator'
  };

  const roleLabel = roleLabels[userRole] || userRole || 'User';

  return (
    <div className="w-full bg-[#f0f0f0] py-3 px-6 md:px-8 flex items-center justify-between border-b border-slate-200/60 sticky top-0 z-40 select-none">

      {/* Left-most Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer group shrink-0"
        onClick={() => navigate('/home')}
      >
        <img
          src="/logo.jpg"
          alt="ForTrace Logo"
          className="h-10 w-auto object-contain rounded-xl shadow-xs border border-slate-200/80 group-hover:scale-105 transition-transform duration-200"
        />
        <span className="font-black text-lg text-[#0a332c] tracking-tight hidden sm:inline-block font-mono">
          ForTrace
        </span>
      </div>

      {/* Centered Navigation Tabs */}
      <div className="flex bg-[#0a332c] p-1.5 rounded-2xl gap-1 flex-wrap justify-center">
        {NAV_ITEMS.map((item) => {
          if (!hasAccess(item.viewName)) return null;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none
                ${isActive
                  ? 'shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
                }
              `}
              style={isActive ? { color: '#0a332c', backgroundColor: '#ffffff' } : {}}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right Top Sign In / Login Button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            handleLogout();
            navigate('/login');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a332c] hover:bg-[#062a24] text-white rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer font-yd-gothic"
        >
          <LogIn size={15} />
          <span>Sign In / Login</span>
        </button>
      </div>

    </div>
  );
}
