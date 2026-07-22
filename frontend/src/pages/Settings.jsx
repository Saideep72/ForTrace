import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Bell, Palette, Factory, Bot,
    CreditCard, Info, Camera, LogOut, CheckCircle2, ChevronRight,
    ShieldCheck, AlertTriangle, Monitor, Smartphone, Activity
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

import HeaderBar from '../components/HeaderBar';

const AnimatedCounter = ({ end, suffix = "", prefix = "", duration = 2000, decimals = 0 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(easeOutProgress * end);
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

const SETTINGS_TABS = [
    { id: 'profile', label: 'Profile', icon: <User size={24} /> },
    { id: 'security', label: 'Security', icon: <Lock size={24} /> },
    { id: 'plant', label: 'Plant Preferences', icon: <Factory size={24} /> },
    { id: 'ai', label: 'AI Preferences', icon: <Bot size={24} /> },
    { id: 'account', label: 'Account', icon: <CreditCard size={24} /> },
    { id: 'about', label: 'About', icon: <Info size={24} /> }
];

export default function Settings() {
    const navigate = useNavigate();
    const [activeMainTab, setActiveMainTab] = useState('settings');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('profile');

    const { theme, setTheme, accent, setAccent, compactMode, setCompactMode } = useTheme();
    const {
        profile, setProfile,
        security, setSecurity,
        notifications, setNotifications,
        appearance, setAppearance,
        plantPrefs, setPlantPrefs,
        aiPrefs, setAiPrefs,
        showToast
    } = useSettings();

    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            showToast('Settings saved successfully!');
        }, 800);
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, avatar: reader.result });
                showToast('Profile photo updated.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoutDevice = (id) => {
        setSecurity({
            ...security,
            sessions: security.sessions.filter(s => s.id !== id)
        });
        showToast('Device logged out.', 'success');
    };

    const handleClearAIHistory = () => {
        // Clear chat messages (mock logic, ideally clears a specific localStorage key used by AIChat)
        localStorage.removeItem('ft-ai-chat-history');
        showToast('AI Conversation History cleared.', 'success');
    };

    const handleDeleteAccount = () => {
        if (window.confirm("Are you sure you want to delete your account? This action is permanent.")) {
            localStorage.clear();
            navigate('/login');
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeSettingsTab) {
            case 'profile':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                        <h2 className="text-xl font-bold text-[var(--c-text)] mb-6">Profile Information</h2>
                        <form onSubmit={handleSave} className="space-y-8">

                            <div className="flex items-center gap-6">
                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/png, image/jpeg" />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-24 h-24 rounded-full bg-[var(--c-bg)] border-2 border-[var(--c-border)] flex items-center justify-center overflow-hidden group cursor-pointer"
                                >
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-[var(--c-text-muted)] group-hover:opacity-0 transition-opacity" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--c-text)]">Profile Photo</h3>
                                    <p className="text-sm text-[var(--c-text-muted)] mb-2">PNG, JPG up to 5MB</p>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-1.5 text-sm font-medium rounded-full border border-[var(--c-border)] hover:bg-[var(--c-bg)] transition-colors">Upload</button>
                                        <button type="button" onClick={() => setProfile({ ...profile, avatar: null })} className="px-4 py-1.5 text-sm font-medium rounded-full text-[var(--c-danger)] hover:bg-red-50 transition-colors">Remove</button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Full Name</label>
                                    <input type="text" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] focus:border-[var(--c-primary)] outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Email Address</label>
                                    <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] focus:border-[var(--c-primary)] outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Phone Number</label>
                                    <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] focus:border-[var(--c-primary)] outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Role (Read Only)</label>
                                    <input type="text" value="Plant Manager" readOnly className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text-muted)] cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Employee ID (Read Only)</label>
                                    <input type="text" value="FT-89234" readOnly className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text-muted)] cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Department</label>
                                    <input type="text" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] focus:border-[var(--c-primary)] outline-none transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Plant Assigned</label>
                                    <select value={profile.plantAssigned} onChange={e => setProfile({ ...profile, plantAssigned: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] focus:border-[var(--c-primary)] outline-none transition-colors">
                                        <option>Plant Alpha</option>
                                        <option>Plant Beta</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Location</label>
                                    <input type="text" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] focus:border-[var(--c-primary)] outline-none transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Bio (Optional)</label>
                                <textarea rows="3" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Brief background..." className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] focus:border-[var(--c-primary)] outline-none transition-colors resize-none" />
                            </div>

                            <div className="pt-4 border-t border-[var(--c-border)] flex justify-end">
                                <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-full bg-[var(--c-primary)] text-white font-medium hover:bg-[var(--c-secondary)] transition-colors flex items-center gap-2">
                                    {isSaving ? <Activity size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                );

            case 'security':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-10">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--c-text)] mb-6">Security</h2>
                            <form onSubmit={handleSave} className="space-y-4 p-6 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl shadow-sm">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Current Password</label>
                                    <input type="password" required placeholder="••••••••" className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] outline-none bg-[var(--c-surface)] text-[var(--c-text)]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">New Password</label>
                                    <input type="password" required placeholder="••••••••" className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] outline-none bg-[var(--c-surface)] text-[var(--c-text)]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Confirm Password</label>
                                    <input type="password" required placeholder="••••••••" className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] outline-none bg-[var(--c-surface)] text-[var(--c-text)]" />
                                </div>
                                <div className="pt-4">
                                    <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-full bg-[var(--c-primary)] text-white font-medium hover:bg-[var(--c-secondary)] transition-colors">
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                );


            case 'plant':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-8">
                        <h2 className="text-xl font-bold text-[var(--c-text)] mb-6">Plant Preferences</h2>

                        <div className="p-6 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl shadow-sm space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Default Plant</label>
                                <select value={plantPrefs.defaultPlant} onChange={e => setPlantPrefs({ ...plantPrefs, defaultPlant: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text)] outline-none">
                                    <option>Plant Alpha</option>
                                    <option>Plant Beta</option>
                                    <option>Plant Gamma</option>
                                </select>
                                <p className="text-xs text-[var(--c-text-muted)] mt-1">Useful if your organization operates multiple facilities.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Default Dashboard</label>
                                <select value={plantPrefs.defaultDashboard} onChange={e => setPlantPrefs({ ...plantPrefs, defaultDashboard: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text)] outline-none">
                                    <option>Overview</option>
                                    <option>Asset Registry</option>
                                    <option>Network</option>
                                    <option>Reports</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Time Zone</label>
                                    <select value={plantPrefs.timeZone} onChange={e => setPlantPrefs({ ...plantPrefs, timeZone: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text)] outline-none">
                                        <option>America/New_York</option>
                                        <option>Europe/London</option>
                                        <option>Asia/Kolkata</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Date Format</label>
                                    <select value={plantPrefs.dateFormat} onChange={e => setPlantPrefs({ ...plantPrefs, dateFormat: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text)] outline-none">
                                        <option>MM/DD/YYYY</option>
                                        <option>DD/MM/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Measurement Units</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="units" checked={plantPrefs.measurementUnits === 'metric'} onChange={() => setPlantPrefs({ ...plantPrefs, measurementUnits: 'metric' })} className="accent-[var(--c-primary)]" />
                                        <span className="text-sm font-medium">Metric (°C, Bar, kg)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="units" checked={plantPrefs.measurementUnits === 'imperial'} onChange={() => setPlantPrefs({ ...plantPrefs, measurementUnits: 'imperial' })} className="accent-[var(--c-primary)]" />
                                        <span className="text-sm font-medium">Imperial (°F, PSI, lbs)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'ai':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-8">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-[var(--c-text)]">AI Preferences</h2>
                        </div>

                        <div className="p-6 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl shadow-sm space-y-6">

                            <div className="flex items-center justify-between pb-4 border-b border-[var(--c-border)]">
                                <div>
                                    <div className="font-semibold text-[var(--c-text)]">Enable AI Suggestions</div>
                                    <div className="text-sm text-[var(--c-text-muted)]">Show smart query prompts in chat.</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={aiPrefs.aiSuggestions} onChange={e => setAiPrefs({ ...aiPrefs, aiSuggestions: e.target.checked })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--c-primary)]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between pb-4 border-b border-[var(--c-border)]">
                                <div>
                                    <div className="font-semibold text-[var(--c-text)]">AI Confidence Score</div>
                                    <div className="text-sm text-[var(--c-text-muted)]">Show confidence percentage on anomaly detection.</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={aiPrefs.confidenceScore} onChange={e => setAiPrefs({ ...aiPrefs, confidenceScore: e.target.checked })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--c-primary)]"></div>
                                </label>
                            </div>

                            <div className="space-y-2 pb-2">
                                <label className="text-sm font-semibold text-[var(--c-text-secondary)]">Default AI Model</label>
                                <select value={aiPrefs.defaultModel} onChange={e => setAiPrefs({ ...aiPrefs, defaultModel: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] text-[var(--c-text)] outline-none">
                                    <option>ForTrace AI (Recommended)</option>
                                    <option>OpenAI GPT-4 Integration</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button onClick={handleClearAIHistory} className="px-5 py-2 text-sm font-semibold rounded-full border border-red-200 text-[var(--c-danger)] hover:bg-red-50 transition-colors">
                                    Clear AI History
                                </button>
                            </div>

                        </div>
                    </motion.div>
                );

            case 'account':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-8">
                        <h2 className="text-xl font-bold text-[var(--c-text)] mb-6">Account Overview</h2>

                        <div className="p-6 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl shadow-sm grid grid-cols-2 gap-y-8 gap-x-6">

                            <div>
                                <div className="text-xs text-[var(--c-text-muted)] font-bold uppercase tracking-wider mb-1">Email</div>
                                <div className="font-medium text-[var(--c-text)]">{profile.email}</div>
                            </div>

                            <div>
                                <div className="text-xs text-[var(--c-text-muted)] font-bold uppercase tracking-wider mb-1">Role</div>
                                <div className="font-medium text-[var(--c-text)]">Plant Manager</div>
                            </div>

                            <div>
                                <div className="text-xs text-[var(--c-text-muted)] font-bold uppercase tracking-wider mb-1">Organization</div>
                                <div className="font-medium text-[var(--c-text)]">ForTrace Industries Ltd.</div>
                            </div>

                            <div>
                                <div className="text-xs text-[var(--c-text-muted)] font-bold uppercase tracking-wider mb-1">License</div>
                                <div className="font-medium text-[var(--c-text)] flex items-center gap-2">
                                    Enterprise Plus <CheckCircle2 size={14} className="text-green-500" />
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-[var(--c-text-muted)] font-bold uppercase tracking-wider mb-1">Joined On</div>
                                <div className="font-medium text-[var(--c-text)]">Oct 14, 2023</div>
                            </div>

                            <div>
                                <div className="text-xs text-[var(--c-text-muted)] font-bold uppercase tracking-wider mb-1">Storage Used</div>
                                <div className="font-medium text-[var(--c-text)]">2.4 GB / 50 GB</div>
                                <div className="w-full h-1.5 bg-[var(--c-bg)] rounded-full mt-2">
                                    <div className="h-full bg-[var(--c-primary)] rounded-full" style={{ width: '5%' }}></div>
                                </div>
                            </div>

                        </div>

                        <div className="flex flex-col gap-4 mt-8">
                            <button onClick={handleLogout} className="flex items-center gap-3 w-fit px-5 py-3 rounded-xl hover:bg-[var(--c-bg)] transition-colors font-semibold text-[var(--c-text-secondary)]">
                                <LogOut size={18} />
                                Logout
                            </button>

                            <div className="border-t border-[var(--c-border)] pt-6 mt-2">
                                <button onClick={handleDeleteAccount} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-50 text-[var(--c-danger)] font-bold hover:bg-red-100 transition-colors shadow-sm">
                                    <AlertTriangle size={18} />
                                    Delete Account
                                </button>
                                <p className="text-xs text-[var(--c-text-muted)] mt-2 ml-2">Deleting your account is permanent and will remove all access to plant data.</p>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'about':
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl space-y-16 py-8">

                        {/* Mission Statement */}
                        <section className="text-center space-y-6 max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-[var(--c-text)]">Our Mission</h2>
                            <p className="text-lg text-[var(--c-text-secondary)] leading-relaxed">
                                Industrial teams lose hours every week hunting for the right SOP, tracing a failure back to its root cause, or figuring out which asset depends on which. ForTrace exists to close that gap — connecting your assets, documents, and failure history into a single traceable system, so decisions on the floor are backed by data, not memory.
                            </p>
                        </section>

                        {/* Stats Row */}
                        <section className="grid grid-cols-4 gap-6">
                            {[
                                { num: 150, suffix: '+', text: 'assets tracked per plant' },
                                { num: 30, suffix: '%', text: 'faster root-cause analysis' },
                                { num: 5, suffix: '', text: 'plant sites onboarded' },
                                { num: 99.9, suffix: '%', text: 'uptime', decimals: 1 }
                            ].map((stat, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] text-center shadow-sm">
                                    <div className="text-4xl font-bold text-[var(--c-primary)] mb-2">
                                        <AnimatedCounter end={stat.num} suffix={stat.suffix} decimals={stat.decimals || 0} />
                                    </div>
                                    <div className="text-sm text-[var(--c-text-secondary)] font-medium">{stat.text}</div>
                                </div>
                            ))}
                        </section>

                        {/* Values / Pillars */}
                        <section className="space-y-8">
                            <h2 className="text-2xl font-bold text-[var(--c-text)] text-center">Our Pillars</h2>
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { title: 'Traceability', desc: 'Every asset, failure, and fix is connected — nothing lives in a silo.', icon: <Activity className="text-[var(--c-primary)] mb-4" size={32} /> },
                                    { title: 'Clarity on the floor', desc: 'Built for control rooms and tablets, not just office dashboards.', icon: <Monitor className="text-[var(--c-primary)] mb-4" size={32} /> },
                                    { title: 'Trust through evidence', desc: 'Decisions backed by causal history, not tribal knowledge.', icon: <ShieldCheck className="text-[var(--c-primary)] mb-4" size={32} /> }
                                ].map((pillar, i) => (
                                    <div key={i} className="p-8 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm hover:shadow-md transition-shadow">
                                        {pillar.icon}
                                        <h3 className="text-xl font-bold text-[var(--c-text)] mb-3">{pillar.title}</h3>
                                        <p className="text-[var(--c-text-secondary)] leading-relaxed">{pillar.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Team Grid */}
                        <section className="space-y-8">
                            <h2 className="text-2xl font-bold text-[var(--c-text)] text-center">The Team</h2>
                            <div className="grid grid-cols-4 gap-6">
                                {[
                                    { name: 'K. Saiuallash Reddy', role: 'Lead Deep Learning Architect', initials: 'KR' },
                                    { name: 'Anushka Prayagkar', role: 'Frontend Developer & UI/UX Designer', initials: 'AP' },
                                    { name: 'Aadesh Singh', role: 'Data Scientist & Backend Pipeline Engineer', initials: 'AS' },
                                    { name: 'Saideep Paladi', role: 'Cloud Infrastructure & DevOps Engineer', initials: 'SP' }
                                ].map((member, i) => (
                                    <div key={i} className="flex flex-col items-center p-6 rounded-3xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-sm hover:shadow-md transition-shadow text-center group">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--c-primary)] to-[var(--c-accent)] text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                            {member.initials}
                                        </div>
                                        <h3 className="font-bold text-[var(--c-text)] mb-1">{member.name}</h3>
                                        <p className="text-xs text-[var(--c-primary)] font-semibold uppercase tracking-wider">{member.role}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>
            <main className="main-content font-inter" style={{ padding: 0, paddingTop: 0, maxWidth: 'none', margin: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <HeaderBar />

                <div className="flex flex-1 overflow-hidden">
                    {/* Settings Internal Sidebar (Narrow Icon Only) */}
                    <div className="w-24 shrink-0 bg-[var(--c-surface)] border-r border-[var(--c-border)] flex flex-col items-center pt-24 pb-8 overflow-y-auto">
                        <nav className="flex flex-col gap-4">
                            {SETTINGS_TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSettingsTab(tab.id)}
                                    title={tab.label}
                                    className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${activeSettingsTab === tab.id
                                        ? 'bg-[var(--c-primary)]/20 text-[var(--c-secondary)] shadow-sm'
                                        : 'text-[var(--c-text-secondary)] hover:bg-[var(--c-bg)] hover:text-[var(--c-text)]'
                                        }`}
                                >
                                    {tab.icon}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Settings Content Area */}
                    <div className="flex-1 overflow-y-auto pt-24 px-8 pb-10">
                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}