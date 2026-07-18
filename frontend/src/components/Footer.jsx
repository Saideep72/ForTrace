import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail } from 'lucide-react';

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function Footer() {
  return (
    <footer className="w-full mt-20 pt-16 pb-8 border-t border-[var(--c-border)] bg-[var(--c-surface)]">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        
        {/* Column 1 - Brand */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-[var(--c-text-secondary)] opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[var(--c-text-muted)]/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[var(--c-text)]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--c-text)]">FortTrace.</span>
          </div>
          <p className="text-sm font-medium text-[var(--c-text-muted)] leading-relaxed">
            Plant operations intelligence, in one place.
          </p>
          <div className="flex items-center gap-4 text-[var(--c-text-muted)]">
            <a href="#" className="hover:text-[var(--c-primary)] transition-colors"><LinkedinIcon size={18} /></a>
            <a href="#" className="hover:text-[var(--c-primary)] transition-colors"><TwitterIcon size={18} /></a>
            <a href="#" className="hover:text-[var(--c-primary)] transition-colors"><Mail size={18} /></a>
          </div>
        </div>

        {/* Column 2 - Product */}
        <div>
          <h4 className="text-sm font-bold text-[var(--c-text)] mb-6 uppercase tracking-wider">Product</h4>
          <ul className="space-y-4 text-sm font-medium text-[var(--c-text-secondary)]">
            <li><Link to="/dashboard" className="hover:text-[var(--c-primary)] transition-colors">Dashboard</Link></li>
            <li><Link to="/operations" className="hover:text-[var(--c-primary)] transition-colors">Operations Center</Link></li>
            <li><Link to="/network" className="hover:text-[var(--c-primary)] transition-colors">Network Graph</Link></li>
            <li><Link to="/ai" className="hover:text-[var(--c-primary)] transition-colors">AI Assistant</Link></li>
          </ul>
        </div>

        {/* Column 3 - Resources */}
        <div>
          <h4 className="text-sm font-bold text-[var(--c-text)] mb-6 uppercase tracking-wider">Resources</h4>
          <ul className="space-y-4 text-sm font-medium text-[var(--c-text-secondary)]">
            <li><a href="#" className="hover:text-[var(--c-primary)] transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-[var(--c-primary)] transition-colors">API Reference</a></li>
            <li><a href="#" className="hover:text-[var(--c-primary)] transition-colors">Release Notes</a></li>
            <li><a href="#" className="hover:text-[var(--c-primary)] transition-colors">Help Center</a></li>
          </ul>
        </div>

        {/* Column 4 - Company */}
        <div>
          <h4 className="text-sm font-bold text-[var(--c-text)] mb-6 uppercase tracking-wider">Company</h4>
          <ul className="space-y-4 text-sm font-medium text-[var(--c-text-secondary)]">
            <li><Link to="/settings" className="hover:text-[var(--c-primary)] transition-colors">About</Link></li>
            <li><a href="#" className="hover:text-[var(--c-primary)] transition-colors">Contact Sales</a></li>
            <li><a href="#" className="hover:text-[var(--c-primary)] transition-colors">Status</a></li>
          </ul>
        </div>

        {/* Column 5 - CTA */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-[var(--c-text)] mb-2 uppercase tracking-wider">Enterprise Readiness</h4>
          <button className="px-6 py-3 rounded-xl bg-[var(--c-primary)] text-white text-sm font-bold hover:bg-[var(--c-secondary)] transition-colors shadow-lg shadow-[var(--c-primary)]/20">
            Request a Demo
          </button>
          <button className="px-6 py-3 rounded-xl bg-transparent border border-[var(--c-border)] text-[var(--c-text)] text-sm font-bold hover:bg-[var(--c-bg)] transition-colors">
            Talk to Sales
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1440px] mx-auto px-6 pt-8 border-t border-[var(--c-border)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-[var(--c-text-muted)]">
        <div>
          &copy; 2026 FortTrace. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[var(--c-text)] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[var(--c-text)] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[var(--c-text)] transition-colors flex items-center gap-1"><ShieldCheck size={14} /> Security</a>
        </div>
      </div>
    </footer>
  );
}
