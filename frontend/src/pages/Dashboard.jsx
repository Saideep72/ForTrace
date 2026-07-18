import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ChevronRight, AlertCircle, FileText, CheckCircle2, FileUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import HeaderBar from '../components/HeaderBar';
import Footer from '../components/Footer';


const MOCK_USER = {
  name: "Admin",
  role: "System_Admin"
};

const MOCK_KPIS = [
  { label: "Plant Health", value: 98, unit: "%", trend: "up", trendValue: "+1.2%" },
  { label: "Total Assets", value: 142, unit: "", trend: "neutral", trendValue: null },
  { label: "Active Alerts", value: 7, unit: "", trend: "down", trendValue: "-3" },
  { label: "Documents Indexed", value: "3,284", unit: "", trend: "up", trendValue: "+12" },
  { label: "Compliance Score", value: 96, unit: "%", trend: "up", trendValue: "+0.5%" },
  { label: "AI Queries Today", value: 54, unit: "", trend: "up", trendValue: "+8" }
];

const trendData = [
  { time: '00:00', health: 98 },
  { time: '04:00', health: 97 },
  { time: '08:00', health: 96 },
  { time: '12:00', health: 96 },
  { time: '16:00', health: 95 },
  { time: '20:00', health: 98 }
];

const equipmentData = [
  { name: 'Running', value: 85, color: '#22c55e' },
  { name: 'Warning', value: 10, color: '#f59e0b' },
  { name: 'Critical', value: 5, color: '#ef4444' }
];

const recentAlerts = [
  { id: 1, equipment: 'Pump E-401', severity: 'critical', message: 'Vibration anomaly detected' },
  { id: 2, equipment: 'Valve V-301', severity: 'warning', message: 'Pressure drop in line 2' },
  { id: 3, equipment: 'Reactor R-101', severity: 'warning', message: 'Temperature approaching limit' }
];

const assetTable = [
  { id: 'E-401', status: 'Running', maint: '3 days ago', health: '97%' },
  { id: 'V-301', status: 'Warning', maint: '15 days ago', health: '82%' },
  { id: 'R-101', status: 'Critical', maint: 'Today', health: '64%' }
];

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>


        <main className="main-content">
          <HeaderBar />
          <motion.div initial="initial" animate="animate" variants={pageVariants}>

            {/* Hero Section */}
            <div style={{ position: 'relative', overflow: 'hidden', padding: '4rem 2rem', marginBottom: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--c-text)', marginBottom: '1.25rem', lineHeight: 1.15 }}>
                  Where industrial intelligence <br/>
                  <span style={{ color: 'var(--c-text)' }}>meets </span>
                  <span style={{ color: 'var(--c-primary)' }}>operational excellence.</span>
                </h1>
                <p style={{ fontSize: '1.15rem', color: 'var(--c-text-secondary)', fontWeight: 400, maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                  Empower your teams with real-time visibility, predictive maintenance, and AI-driven decision support.
                </p>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
              {MOCK_KPIS.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-value">{kpi.value}<span style={{ fontSize: '1rem', marginLeft: '2px' }}>{kpi.unit}</span></div>
                </div>
              ))}
            </div>

            {/* Middle Grid: Charts */}
            <div className="grid-2-1">

              {/* Asset Health Trend */}
              <div className="card">
                <div className="card-body">
                  <h2 className="section-label">Asset Health Trend</h2>
                  <div style={{ height: '260px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--c-text-muted)', fontSize: 12 }} />
                        <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--c-text-muted)', fontSize: 12 }} />
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
                        />
                        <Line type="monotone" dataKey="health" stroke="var(--c-primary)" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Equipment Status */}
              <div className="card">
                <div className="card-body" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <h2 className="section-label">Equipment Status</h2>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={equipmentData}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {equipmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-text)', lineHeight: 1 }}>142</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', textTransform: 'uppercase' }}>Assets</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Lower Grid: Mixed Widgets */}
            <div className="grid-2-1">

              {/* Left Column Widgets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div className="grid-1-1">
                  {/* Predictive Maintenance Schedule */}
                  <div className="card">
                    <div className="card-body">
                      <h2 className="section-label">Predictive Maintenance</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-warning)', border: '2px solid #fff', boxShadow: '0 0 0 1px var(--c-warning)' }}></div>
                            <div style={{ width: 2, flex: 1, background: 'rgba(0,0,0,0.05)', margin: '4px 0' }}></div>
                          </div>
                          <div style={{ paddingBottom: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text)' }}>Replace Filter F-20</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>Due in 2 days • Preventive</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--c-primary)', border: '2px solid #fff', boxShadow: '0 0 0 1px var(--c-primary)' }}></div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text)' }}>Calibrate Sensor S-09</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>Due in 5 days • Routine</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Alerts */}
                  <div className="card">
                    <div className="card-body">
                      <h2 className="section-label">Recent Alerts</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentAlerts.map(alert => (
                          <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: alert.severity === 'critical' ? 'var(--c-danger)' : 'var(--c-warning)', marginTop: 6, flexShrink: 0 }}></div>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text)' }}>{alert.equipment}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--c-text-secondary)' }}>{alert.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Assistant Banner */}
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(6,182,212,0.05))', border: '1px solid rgba(37,99,235,0.1)' }}>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--c-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
                        <Bot size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: '0.2rem' }}>Ask AI Assistant</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)' }}>"Why did Reactor R-101 trip yesterday?"</p>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/ai')}>
                      Ask AI <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column Widgets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Asset Overview Table */}
                <div className="card" style={{ flex: 1 }}>
                  <div className="card-body">
                    <h2 className="section-label">Asset Overview</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                          <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>ASSET</th>
                          <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>STATUS</th>
                          <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>LAST MAINT.</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem 0', fontSize: '0.75rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>HEALTH</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetTable.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                            <td style={{ padding: '0.85rem 0', fontSize: '0.85rem', fontWeight: 500, color: 'var(--c-text)' }}>{row.id}</td>
                            <td style={{ padding: '0.85rem 0' }}>
                              <span style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: row.status === 'Running' ? 'rgba(34,197,94,0.1)' : row.status === 'Warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                color: row.status === 'Running' ? 'var(--c-success)' : row.status === 'Warning' ? 'var(--c-warning)' : 'var(--c-danger)'
                              }}>
                                {row.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 0', fontSize: '0.85rem', color: 'var(--c-text-secondary)' }}>{row.maint}</td>
                            <td style={{ padding: '0.85rem 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text)', textAlign: 'right' }}>{row.health}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Uploads */}
                <div className="card">
                  <div className="card-body">
                    <h2 className="section-label">Recent Uploads</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                        <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}><FileText size={16} color="var(--c-primary)" /></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--c-text)' }}>P&ID.pdf</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                        <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}><FileUp size={16} color="var(--c-secondary)" /></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--c-text)' }}>Scan_3.png</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
          <Footer />
        </main>
      </div>
    </>
  );
}