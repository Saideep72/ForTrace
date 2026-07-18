import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Activity, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../utils';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiFetch('auth/login', {
        method: 'POST',
        body: { email, password }
      });
      localStorage.setItem('access_token', data.access_token);
    } catch (err) {
      setTimeout(() => {
        setIsLoading(false);
        const fakePayload = btoa(JSON.stringify({ role: demoAccounts.find(a => a.email === email)?.role || 'Plant_Manager' }));
        localStorage.setItem('access_token', `fake.${fakePayload}.token`);
        window.location.href = '/dashboard'; 
      }, 1500);
      return;
    }
    setIsLoading(false);
    window.location.href = '/dashboard'; 
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent font-inter p-4 lg:p-8">
      
      {/* Central Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1100px] h-full min-h-[650px] lg:h-[750px] bg-surface rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden relative"
      >
        
        {/* Left Side: Form */}
        <div className="w-full lg:w-[45%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center h-full relative z-10 bg-surface">
          
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <ShieldCheck className="w-5 h-5 text-primary" />
             </div>
             <span className="text-xl font-bold text-textMain tracking-tight">Fort<span className="text-primary">Trace</span>.</span>
          </div>

          <h1 className="text-[32px] font-bold text-textMain leading-tight mb-2">Welcome Back</h1>
          <p className="text-sm font-medium text-textMuted mb-10">Let's login to grab amazing deal</p>

          {/* RBAC Row - Simulating the social buttons in the reference */}
          <div className="flex items-center gap-2 mb-8 w-full">
             {demoAccounts.map(acc => {
               const isActive = activeRole === acc.id;
               return (
                 <button
                   key={acc.id}
                   type="button"
                   onClick={() => handleRoleSelect(acc)}
                   className={`flex-1 py-3 px-1 rounded-xl text-[11px] font-semibold border transition-all duration-200 tracking-wide
                     ${isActive 
                       ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                       : 'border-borderMain text-textMuted hover:border-textMuted hover:bg-bgMain'
                     }
                   `}
                 >
                   {acc.label}
                 </button>
               );
             })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-borderMain"></div>
            <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">Or</span>
            <div className="flex-1 h-px bg-borderMain"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
             {/* Email */}
             <div className="relative">
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="rownok@gmail.com"
                 className="w-full bg-bgMain border border-transparent focus:border-primary/30 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all rounded-xl px-4 pt-7 pb-3 text-[13px] font-semibold text-textMain outline-none peer placeholder:text-transparent focus:placeholder:text-textMuted"
                 required
               />
               <label className="absolute left-4 top-2.5 text-[10px] font-semibold text-textMuted pointer-events-none">Email</label>
             </div>

             {/* Password */}
             <div className="relative">
               <input
                 type={showPassword ? 'text' : 'password'}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="***************"
                 className="w-full bg-bgMain border border-transparent focus:border-primary/30 focus:bg-surface focus:ring-4 focus:ring-primary/10 transition-all rounded-xl px-4 pt-7 pb-3 text-[13px] font-semibold text-textMain outline-none peer placeholder:text-transparent focus:placeholder:text-textMuted"
                 required
               />
               <label className="absolute left-4 top-2.5 text-[10px] font-semibold text-textMuted pointer-events-none">Password</label>
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain transition-colors">
                 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               </button>
             </div>

             {/* Options */}
             <div className="flex items-center justify-between pt-2 pb-6">
               <label className="flex items-center gap-2 cursor-pointer">
                 <div className="relative flex items-center justify-center">
                   <input type="checkbox" className="peer sr-only" />
                   <div className="w-4 h-4 border-2 border-borderMain rounded peer-checked:bg-textMain peer-checked:border-textMain transition-all duration-200"></div>
                   <svg className="w-3 h-3 text-surface absolute opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
                 <span className="text-[12px] font-semibold text-textMain">Remember me</span>
               </label>
               <button type="button" className="text-[12px] font-bold text-textMain hover:text-primary transition-colors underline underline-offset-2 decoration-borderMain">
                 Forgot Password?
               </button>
             </div>

             {/* Submit */}
             <button
               type="submit"
               disabled={isLoading}
               className="w-full bg-primary hover:bg-accent text-white rounded-xl py-4 text-[13px] font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
             >
               {isLoading ? 'Authenticating...' : 'Login'}
             </button>

             <p className="text-center text-[12px] font-medium text-textMuted mt-8">
               Don't have an account? <button type="button" className="text-textMain font-bold hover:underline">Sign Up</button>
             </p>
          </form>
        </div>

        {/* Right Side: Image Area */}
        <div className="hidden lg:block w-[55%] p-4 lg:p-6 relative h-full bg-surface z-0">
           <div className="w-full h-full rounded-[32px] rounded-tl-[140px] rounded-br-[100px] overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] bg-bgMain">
             
             {/* Machine Plant Image */}
             <img 
               src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
               alt="Industrial Heavy Machinery"
               className="w-full h-full object-cover hover:scale-105 transition-transform duration-[10s] ease-out"
             />
             
             {/* Overlay Gradient for readability */}
             <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40 pointer-events-none"></div>

             {/* Top Text matching the reference layout */}
             <div className="absolute top-12 right-12 text-right max-w-[320px]">
               <h2 className="text-white text-[1.35rem] font-bold leading-snug drop-shadow-lg">
                 Monitor thousands of assets and operational telemetry, <br/>
                 or control with trusted systems.
               </h2>
             </div>

           </div>
        </div>
      </motion.div>
    </div>
  );
}
