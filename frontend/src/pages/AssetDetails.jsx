import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit3, Image as ImageIcon, FileText, 
  Download, BarChart2, CheckCircle2, Activity,
  Settings, UploadCloud, Cpu
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import HeaderBar from '../components/HeaderBar';
import SideNav from '../components/SideNav';
import { apiFetch } from '../utils';

// Mock data for the chart
const healthData = [
  { time: '00:00', health: 98 },
  { time: '04:00', health: 97 },
  { time: '08:00', health: 99 },
  { time: '12:00', health: 95 },
  { time: '16:00', health: 91 },
  { time: '20:00', health: 93 },
  { time: '24:00', health: 96 }
];

const MOCK_MAINTENANCE = [
  { id: 1, title: 'Routine Inspection - Today', status: 'Completed', date: 'Today' },
  { id: 2, title: 'Pressure Valve Replaced', status: 'Completed', date: '02 Jul 2026' },
  { id: 3, title: 'Calibration', status: 'Completed', date: '18 Jun 2026' },
  { id: 4, title: 'Temperature Sensor Installed', status: 'Completed', date: '12 Apr 2026' }
];

const MOCK_DOCS = [
  { id: 1, name: 'Operation Manual.pdf', type: 'document' },
  { id: 2, name: 'Maintenance Report.pdf', type: 'document' },
  { id: 3, name: 'Warranty.pdf', type: 'document' },
  { id: 4, name: 'Boiler Schematic', type: 'image' }
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const getStatusColor = (status) => {
  if (status === 'Healthy') return 'var(--c-success)';
  if (status === 'Warning') return 'var(--c-warning)';
  if (status === 'Critical') return 'var(--c-danger)';
  return 'var(--c-text-muted)';
};

export default function AssetDetails({ defaultTab = 'assets' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch based on id
    async function loadAsset() {
      try {
        // const result = await apiFetch(`assets/${id}`);
        // setAsset(result);
        
        // Mock fallback based on wireframe
        setAsset({
          id: id || 'FT-BO-003',
          tag: 'Boiler-03',
          type: 'Boiler',
          manufacturer: 'Siemens',
          installed: '12 Mar 2022',
          location: 'Plant Alpha',
          model: 'STB-450',
          lastService: '02 Jul 2026',
          nextService: '18 Aug 2026',
          status: 'Healthy',
          image: '/machines/machine1.jpg', // Placeholder
        });
      } catch (err) {
        console.error("Failed to load asset details", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAsset();
  }, [id]);

  if (isLoading || !asset) {
    return <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>
      <SideNav activeTab={defaultTab} setActiveTab={() => {}} isCollapsed={isCollapsed} onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      
      <main className="main-content" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <HeaderBar />
        
        <div style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <motion.div initial="initial" animate="animate" variants={pageVariants}>
            
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <button onClick={() => navigate('/assets')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--c-text-secondary)', padding: '0.5rem 0', fontWeight: 600 }}>
                <ArrowLeft size={18} /> Back to Asset Registry
              </button>
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow)' }}>
                Edit <Edit3 size={16} />
              </button>
            </div>

            {/* Asset Header Info */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', color: 'var(--c-text)' }}>
                  {asset.tag}
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--c-text-secondary)', margin: 0, fontWeight: 500 }}>
                  Industrial Steam {asset.type}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: getStatusColor(asset.status), boxShadow: `0 0 12px ${getStatusColor(asset.status)}` }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: getStatusColor(asset.status) }}>{asset.status}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--c-text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>
                  Asset ID : {asset.id}
                </div>
              </div>
            </motion.div>

            {/* Grid Area 1: Image and Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              
              {/* Asset Image */}
              <motion.div variants={itemVariants} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ color: 'var(--c-text-secondary)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Image</div>
                <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.03)', position: 'relative', minHeight: '300px' }}>
                  <div style={{ position: 'absolute', inset: 0, background: `url(${asset.image}) center/cover no-repeat`, filter: 'brightness(0.95)' }} />
                  {/* Fallback pattern if no image */}
                  {!asset.image && (
                     <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-muted)' }}>
                       <ImageIcon size={48} opacity={0.3} />
                     </div>
                  )}
                </div>
              </motion.div>

              {/* Asset Information */}
              <motion.div variants={itemVariants} className="card" style={{ padding: '2rem', height: '100%', background: 'linear-gradient(145deg, var(--c-surface), rgba(255,255,255,0.6))' }}>
                <div style={{ color: 'var(--c-text-secondary)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Information</div>
                <div style={{ borderBottom: '1px solid var(--c-border)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}></div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.2rem', fontSize: '0.95rem' }}>
                  <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Type</div>
                  <div style={{ fontWeight: 600 }}>: {asset.type}</div>
                  
                  <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Manufacturer</div>
                  <div style={{ fontWeight: 600 }}>: {asset.manufacturer}</div>
                  
                  <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Installed</div>
                  <div style={{ fontWeight: 600 }}>: {asset.installed}</div>
                  
                  <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Location</div>
                  <div style={{ fontWeight: 600 }}>: {asset.location}</div>
                  
                  <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Model</div>
                  <div style={{ fontWeight: 600 }}>: {asset.model}</div>
                  
                  <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Last Service</div>
                  <div style={{ fontWeight: 600 }}>: {asset.lastService}</div>
                  
                  <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Next Service</div>
                  <div style={{ fontWeight: 600 }}>: {asset.nextService}</div>
                </div>
              </motion.div>
            </div>

            {/* Grid Area 2: Health Trend and AI Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              
              {/* Health Trend */}
              <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ color: 'var(--c-text-secondary)', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Trend (Line Chart)</div>
                <div style={{ height: '240px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--c-text-muted)' }} dy={10} />
                      <YAxis domain={['dataMin - 5', 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--c-text-muted)' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                        itemStyle={{ color: 'var(--c-primary)', fontWeight: 600 }}
                      />
                      <Line type="monotone" dataKey="health" stroke="var(--c-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--c-accent)' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* AI Insights */}
              <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(37,99,235,0.08) 100%)', border: '1px solid rgba(37,99,235,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-primary)', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Cpu size={18} /> AI Insights
                </div>
                <div style={{ borderBottom: '1px solid rgba(37,99,235,0.15)', marginBottom: '1.5rem' }}></div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-primary)', marginTop: '8px' }} />
                    <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--c-text)' }}><strong>Pressure stable</strong> across all primary valves during peak operation.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-warning)', marginTop: '8px' }} />
                    <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--c-text)' }}><strong>12% higher vibration</strong> detected in secondary housing compared to last month.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-primary)', marginTop: '8px' }} />
                    <span style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--c-text)' }}><strong>Maintenance recommended</strong> in 14 days based on predictive degradation model.</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Recent Maintenance Timeline */}
            <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--c-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ color: 'var(--c-text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Maintenance Timeline</div>
                <button className="btn" style={{ background: 'transparent', color: 'var(--c-primary)', fontWeight: 600, fontSize: '0.85rem' }}>View All</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {MOCK_MAINTENANCE.map(task => (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background='rgba(0,0,0,0.04)'} onMouseLeave={(e) => e.currentTarget.style.background='rgba(0,0,0,0.02)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <CheckCircle2 size={18} color="var(--c-success)" />
                      <span style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '0.95rem' }}>{task.title}</span>
                      <span style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem' }}>- {task.date}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)', background: 'var(--c-surface)', padding: '0.25rem 0.75rem', borderRadius: '99px', border: '1px solid var(--c-border)' }}>
                      {task.status}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Documents and Images */}
            <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem', borderBottom: '1px solid var(--c-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ color: 'var(--c-text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</div>
                <div style={{ color: 'var(--c-text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Images</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {MOCK_DOCS.map(doc => (
                  <div key={doc.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s ease' }} className="doc-row" onMouseEnter={(e) => e.currentTarget.style.background='rgba(0,0,0,0.03)'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {doc.type === 'document' ? <FileText size={18} color="var(--c-primary)" /> : <ImageIcon size={18} color="var(--c-accent)" />}
                      <span style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--c-text)' }}>{doc.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {doc.type === 'document' ? (
                        <div style={{ padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-text-muted)' }}>[ PDF ]</div>
                      ) : (
                        <div style={{ padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-text-muted)' }}>[ Image ]</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bottom Action Bar */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow)', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
                <ImageIcon size={16} /> Upload Image
              </button>
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow)', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
                <UploadCloud size={16} /> Upload Document
              </button>
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow)', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
                <Download size={16} /> Generate Report
              </button>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, boxShadow: '0 8px 16px rgba(37,99,235,0.25)', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
                <Cpu size={16} /> AI Analysis
              </button>
            </motion.div>

            {/* Extra padding at bottom for scrolling */}
            <div style={{ height: '4rem' }}></div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
