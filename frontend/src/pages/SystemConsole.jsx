import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Key, Eye } from 'lucide-react';
import { apiLogs, getUserRole } from '../utils';

export default function SystemConsole() {
  const userRole = getUserRole();
  const isAdmin = userRole === 'Admin';

  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [logsText, setLogsText] = useState('');

  // Load tokens and bind to apiLogs changes
  useEffect(() => {
    if (isAdmin) {
      setAccessToken(localStorage.getItem('access_token') || '');
      setRefreshToken(localStorage.getItem('refresh_token') || '');
      setLogsText(apiLogs.join(''));

      const handleNewLog = () => {
        setLogsText(apiLogs.join(''));
      };

      window.addEventListener('ft-new-api-log', handleNewLog);
      return () => {
        window.removeEventListener('ft-new-api-log', handleNewLog);
      };
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-textMuted font-inter">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="mt-2 text-xs font-semibold">You do not have permission to view the System Console.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 font-inter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">System Debug Console</h1>
        <p className="text-sm font-medium text-textMuted mt-1">
          Inspect backend REST payload communications, access tokens registries, and logs.
        </p>
      </div>

      <div className="bg-surface border border-borderMain rounded-2xl p-6 shadow-sm space-y-5 text-xs text-textSecondary">
        {/* Token Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
              <Key size={12} />
              API Access Bearer Token
            </label>
            <textarea 
              rows={3}
              readOnly
              value={accessToken}
              className="w-full bg-bgMain border border-borderMain rounded-xl p-3 font-mono text-[10.5px] text-textSecondary outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
              <Shield size={12} />
              API Refresh Token
            </label>
            <input 
              type="text"
              readOnly
              value={refreshToken}
              className="w-full bg-bgMain border border-borderMain rounded-xl p-3 font-mono text-[10.5px] text-textSecondary outline-none"
            />
          </div>
        </div>

        {/* Debug Logs Console */}
        <div className="space-y-2 pt-2">
          <label className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
            <Terminal size={14} />
            Raw Response Logs Console
          </label>
          
          <textarea 
            rows={14}
            readOnly
            value={logsText}
            placeholder="Communications logs will append here..."
            className="w-full bg-slate-900 border border-slate-800 text-sky-400 rounded-xl p-4 font-mono text-[11px] leading-relaxed outline-none resize-y shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
