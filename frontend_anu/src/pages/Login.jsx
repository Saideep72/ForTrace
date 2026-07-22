import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, User, Mail, Lock, UserCheck } from 'lucide-react';
import { apiFetch } from '../utils';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific states
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Plant_Manager');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [activeRole, setActiveRole] = useState(null);

  const demoAccounts = [
    { id: 'mgr', label: 'Manager', role: 'Plant_Manager', email: 'manager@plant.com', password: 'Manager@123' },
    { id: 'eng', label: 'Engineer', role: 'Maintenance_Engineer', email: 'engineer@plant.com', password: 'Pass@123' },
    { id: 'adm', label: 'Admin', role: 'Admin', email: 'admin@plant.com', password: 'Pass@123' },
    { id: 'tech', label: 'Field Tech', role: 'Field_Technician', email: 'tech@plant.com', password: 'Pass@123' },
    { id: 'aud', label: 'Auditor', role: 'Auditor', email: 'auditor@plant.com', password: 'Pass@123' },
  ];

  const handleRoleSelect = (acc) => {
    setActiveRole(acc.id);
    setEmail(acc.email);
    setPassword(acc.password);
    setStatusMessage({ text: `Preloaded credentials for ${acc.label}`, type: 'success' });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ text: 'Authenticating credentials...', type: 'info' });

    const bodyParams = new URLSearchParams();
    bodyParams.append('username', email);
    bodyParams.append('password', password);

    try {
      const data = await apiFetch('auth/login', {
        method: 'POST',
        body: bodyParams
      });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token || '');
      localStorage.setItem('user_email', email);
      
      setStatusMessage({ text: 'Authentication successful. Access granted.', type: 'success' });
      setIsLoading(false);
      
      // Delay redirect slightly for visual confirmation feedback
      setTimeout(() => {
        window.location.href = '/home';
      }, 500);

    } catch (err) {
      setIsLoading(false);
      setStatusMessage({ text: `Authentication Failed: ${err.message}`, type: 'error' });
      
      // Local fallback in case the database is totally empty, enabling first-time setup
      console.warn("API Auth failed, checking demo fallback...", err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ text: 'Registering tester account...', type: 'info' });

    const payload = {
      email,
      password,
      full_name: fullName,
      role: selectedRole
    };

    try {
      const data = await apiFetch('auth/register', {
        method: 'POST',
        body: payload
      });

      setStatusMessage({ text: 'Account registered successfully! You can now sign in.', type: 'success' });
      setIsLoading(false);
      setIsRegister(false); // Switch to sign in view automatically
      setPassword('');      // Clear password for safety
    } catch (err) {
      setIsLoading(false);
      setStatusMessage({ text: `Registration Failed: ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent font-inter p-4 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1100px] min-h-[650px] lg:h-[750px] bg-surface rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden relative border border-borderMain"
      >
        {/* Left Side: Form Container */}
        <div className="w-full lg:w-[48%] p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative z-10 bg-surface">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 mb-8">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <ShieldCheck className="w-5 h-5 text-secondary" style={{ color: 'var(--c-secondary)' }} />
             </div>
             <span className="text-xl font-bold text-textMain tracking-tight">Fort<span style={{ color: 'var(--c-secondary)' }}>Trace</span>.</span>
          </div>

          <h1 className="text-[28px] font-bold text-textMain leading-tight mb-1">
            {isRegister ? 'Register Tester' : 'Industrial Intelligence'}
          </h1>
          <p className="text-sm font-medium text-textMuted mb-6">
            {isRegister ? 'Create an audit-compliant user profile' : 'Sign in to access plant operations RAG dashboards'}
          </p>

          {/* Quick Role Select Buttons (Only in Login Mode) */}
          {!isRegister && (
            <div className="mb-6">
              <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-2">Preload Account Profiles:</span>
              <div className="flex items-center gap-1.5 w-full flex-wrap">
                 {demoAccounts.map(acc => {
                   const isActive = activeRole === acc.id;
                   return (
                     <button
                       key={acc.id}
                       type="button"
                       onClick={() => handleRoleSelect(acc)}
                       className={`py-2 px-3 rounded-lg text-[11px] font-semibold border transition-all duration-200
                         ${isActive 
                           ? 'border-secondary bg-secondary/5 text-secondary shadow-sm' 
                           : 'border-borderMain text-textMuted hover:border-textMuted hover:bg-bgMain'
                         }
                       `}
                     >
                       {acc.label}
                     </button>
                   );
                 })}
              </div>
            </div>
          )}

          {/* Alert Status Area */}
          {statusMessage.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold mb-4 border ${
              statusMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
              statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
              'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              {statusMessage.text}
            </div>
          )}

          {/* Auth forms */}
          <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-3.5">
            {isRegister && (
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-bgMain border border-transparent focus:border-secondary/30 focus:bg-surface focus:ring-4 focus:ring-secondary/10 transition-all rounded-xl px-4 pt-6 pb-2 text-[13px] font-semibold text-textMain outline-none"
                  required
                />
                <label className="absolute left-4 top-2 text-[10px] font-semibold text-textMuted">Full Name</label>
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@plant.com"
                className="w-full bg-bgMain border border-transparent focus:border-secondary/30 focus:bg-surface focus:ring-4 focus:ring-secondary/10 transition-all rounded-xl px-4 pt-6 pb-2 text-[13px] font-semibold text-textMain outline-none"
                required
              />
              <label className="absolute left-4 top-2 text-[10px] font-semibold text-textMuted">Email Address</label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-bgMain border border-transparent focus:border-secondary/30 focus:bg-surface focus:ring-4 focus:ring-secondary/10 transition-all rounded-xl px-4 pt-6 pb-2 text-[13px] font-semibold text-textMain outline-none"
                required
              />
              <label className="absolute left-4 top-2 text-[10px] font-semibold text-textMuted">Password</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain transition-colors">
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            {isRegister && (
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-bgMain border border-transparent focus:border-secondary/30 focus:bg-surface focus:ring-4 focus:ring-secondary/10 transition-all rounded-xl px-4 pt-6 pb-2 text-[13px] font-semibold text-textMain outline-none appearance-none"
                >
                  <option value="Plant_Manager">Plant Manager</option>
                  <option value="Maintenance_Engineer">Maintenance Engineer</option>
                  <option value="Safety_Officer">Safety Officer</option>
                  <option value="Field_Technician">Field Technician</option>
                  <option value="Quality_Engineer">Quality Engineer</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Admin">System Administrator</option>
                </select>
                <label className="absolute left-4 top-2 text-[10px] font-semibold text-textMuted">Plant User Role</label>
              </div>
            )}

            {/* Actions submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-tertiary text-white rounded-xl py-3.5 text-[13px] font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-4"
              style={{ backgroundColor: 'var(--c-secondary)' }}
            >
              {isLoading ? 'Processing Transaction...' : (isRegister ? 'Register Account' : 'Sign In')}
            </button>

            <p className="text-center text-[12px] font-medium text-textMuted mt-4">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                type="button" 
                onClick={() => {
                  setIsRegister(!isRegister);
                  setStatusMessage({ text: '', type: '' });
                }} 
                className="text-textMain font-bold hover:underline"
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </form>
        </div>

        {/* Right Side: Showcase Panel */}
        <div className="hidden lg:block w-[52%] p-5 relative h-full bg-surface z-0">
           <div className="w-full h-full rounded-[30px] rounded-tl-[120px] rounded-br-[80px] overflow-hidden relative bg-bgMain">
             <img 
               src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
               alt="Plant Machinery Operations"
               className="w-full h-full object-cover opacity-90"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none"></div>
             
             <div className="absolute bottom-10 left-10 right-10">
               <h2 className="text-white text-[1.4rem] font-bold leading-snug drop-shadow-md">
                 Industrial Knowledge Base
               </h2>
               <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                 Explore causal-link mapping topology, query multi-agent orchestrator enclaves, and generate compliance root cause reports directly from active plant telemetry.
               </p>
             </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
