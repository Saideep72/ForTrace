import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Plus, X, Activity, Thermometer, Droplets, Zap, Filter, MapPin } from 'lucide-react';
import HeaderBar from '../components/HeaderBar';
import SideNav from '../components/SideNav';
import { apiFetch } from '../utils';

const MOCK_ASSETS = [
  { id: 1, tag: 'Boiler-03', type: 'Boiler', status: 'Healthy', plant: 'Plant A', image: '/machines/machine1.jpg', description: 'High-pressure steam boiler unit for primary heating. Operating at optimal efficiency with no detected anomalies in the past 30 days.', temp: '145°C', pressure: '4.2 bar', vibration: '0.8 mm/s' },
  { id: 2, tag: 'Pump-A12', type: 'Pump', status: 'Warning', plant: 'Plant B', image: '/machines/machine2.jpg', description: 'Centrifugal pump for coolant circulation. Slight vibration anomaly detected in the primary bearing.', temp: '82°C', pressure: '2.1 bar', vibration: '3.4 mm/s' },
  { id: 3, tag: 'Conveyor-2', type: 'Conveyor', status: 'Critical', plant: 'Plant A', image: '/machines/machine3.jpg', description: 'Main assembly line transport conveyor. Immediate attention required: motor overheating and belt misalignment detected.', temp: '105°C', pressure: 'N/A', vibration: '8.2 mm/s' },
  { id: 4, tag: 'Motor-07', type: 'Motor', status: 'Healthy', plant: 'Plant C', image: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=800&q=80', description: 'Heavy-duty induction motor for crusher unit. Recent maintenance performed 2 weeks ago.', temp: '60°C', pressure: 'N/A', vibration: '1.2 mm/s' },
  { id: 5, tag: 'Valve-V9', type: 'Valve', status: 'Healthy', plant: 'Plant A', image: '/machines/machine5.jpg', description: 'Pneumatic control valve for steam line. Operating within normal parameters.', temp: '140°C', pressure: '4.1 bar', vibration: '0.1 mm/s' },
  { id: 6, tag: 'Compressor-1', type: 'Compressor', status: 'Warning', plant: 'Plant B', image: '/machines/machine6.jpg', description: 'Rotary screw air compressor. Filter replacement recommended in 5 days.', temp: '95°C', pressure: '8.5 bar', vibration: '4.1 mm/s' },
  { id: 7, tag: 'Generator-G2', type: 'Generator', status: 'Healthy', plant: 'Plant C', image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80', description: 'Backup diesel generator system. Standby mode active, weekly self-test passed.', temp: '30°C', pressure: 'N/A', vibration: '0.0 mm/s' },
  { id: 8, tag: 'Chiller-CH4', type: 'Chiller', status: 'Healthy', plant: 'Plant A', image: '/machines/machine8.jpg', description: 'Industrial water chiller unit. Coolant levels nominal.', temp: '5°C', pressure: '3.2 bar', vibration: '0.9 mm/s' }
];

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.05 } }
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }
};

const getStatusColor = (status) => {
  if (status === 'Healthy') return 'var(--c-success)';
  if (status === 'Warning') return 'var(--c-warning)';
  if (status === 'Critical') return 'var(--c-danger)';
  return 'var(--c-text-muted)';
};

export default function Assets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assets');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingAsset, setIsEditingAsset] = useState(false);

  // New Asset Form State
  const [newAssetForm, setNewAssetForm] = useState({ tag: '', type: 'Boiler', plant: 'Plant A', imagePreview: '' });

  useEffect(() => {
    async function loadAssets() {
      try {
        const result = await apiFetch('assets/', { params: { limit: 100, offset: 0 } });
        
        const mappedAssets = (result.data || []).map(a => ({
          id: a.id,
          tag: a.equipment_tag || `Asset-${a.id}`,
          type: a.equipment_type || 'Equipment',
          status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Healthy',
          plant: a.manufacturer || 'Main Plant',
          image: a.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
          description: `Industrial ${a.equipment_type || 'equipment'} unit manufactured by ${a.manufacturer || 'Unknown'}. Operating within standard parameters.`,
          temp: 'N/A',
          pressure: 'N/A',
          vibration: 'N/A'
        }));
        
        setAssets(mappedAssets.length > 0 ? mappedAssets : MOCK_ASSETS);
      } catch (err) {
        console.error("Failed to load assets", err);
        setAssets(MOCK_ASSETS); // Fallback for local demo
      } finally {
        setIsLoading(false);
      }
    }
    loadAssets();
  }, []);

  // Simple filtering
  const filteredAssets = assets.filter(a => 
    a.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterAsset = (e) => {
    e.preventDefault();
    if (!newAssetForm.tag.trim()) return;
    
    const newAsset = {
      id: Date.now(),
      tag: newAssetForm.tag,
      type: newAssetForm.type,
      status: 'Healthy',
      plant: newAssetForm.plant,
      image: newAssetForm.imagePreview || 'https://images.unsplash.com/photo-1581092160562-40aa23373a05?auto=format&fit=crop&w=800&q=80',
      description: 'Newly registered asset.',
      temp: 'N/A', pressure: 'N/A', vibration: 'N/A'
    };
    
    setAssets([newAsset, ...assets]);
    setIsRegisterModalOpen(false);
    setNewAssetForm({ tag: '', type: 'Boiler', plant: 'Plant A', imagePreview: '' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAssetForm({ ...newAssetForm, imagePreview: URL.createObjectURL(file) });
    }
  };

  const handleSaveEdit = () => {
    setAssets(assets.map(a => a.id === selectedAsset.id ? selectedAsset : a));
    setIsEditingAsset(false);
  };

  return (
    <>
      <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>
        <SideNav activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isCollapsed} onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        
        <main className="main-content" style={{ position: 'relative' }}>
          <HeaderBar />
          <motion.div initial="initial" animate="animate" variants={pageVariants} style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 800, 
                  letterSpacing: '-0.03em', 
                  background: 'linear-gradient(135deg, var(--c-primary) 0%, var(--c-secondary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 0.5rem 0'
                }}>
                  Asset Registry
                </h1>
                <p className="page-subtitle" style={{ fontSize: '0.95rem' }}>Manage and monitor all plant assets in real-time.</p>
              </div>
              <button onClick={() => setIsRegisterModalOpen(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', boxShadow: '0 8px 16px rgba(37,99,235,0.2)' }}>
                <Plus size={18} /> Register Asset
              </button>
            </div>

            {/* Floating Pill Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', position: 'sticky', top: '80px', zIndex: 40 }}>
              <div style={{ 
                display: 'flex', gap: '0.4rem', alignItems: 'center', 
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
                padding: '0.4rem', borderRadius: '9999px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)'
              }}>
                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search tag or type..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', 
                      background: 'transparent', border: 'none', 
                      borderRadius: '9999px', fontSize: '0.9rem', outline: 'none',
                      transition: 'background 0.2s ease'
                    }} 
                    onFocus={(e) => { e.target.style.background = 'rgba(0,0,0,0.03)'; }}
                    onBlur={(e) => { e.target.style.background = 'transparent'; }}
                  />
                </div>
                
                {['Type', 'Status', 'Plant'].map(filter => (
                  <button key={filter} className="btn btn-secondary" style={{ background: 'transparent', border: 'none', borderRadius: '9999px', padding: '0.65rem 1.25rem' }}>
                    {filter} <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                ))}

                <div style={{ width: '1px', height: '24px', background: 'var(--c-border)', margin: '0 0.5rem' }}></div>

                <button className="btn" style={{ background: 'transparent', color: 'var(--c-text-muted)', fontSize: '0.85rem', padding: '0.65rem 1.25rem', borderRadius: '9999px' }} onClick={() => setSearchQuery('')}>
                  Reset
                </button>
              </div>
            </div>

            {/* Asset Grid */}
            <motion.div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '4rem'
              }}
            >
              {filteredAssets.map((asset) => (
                <motion.div 
                  key={asset.id} 
                  variants={cardVariants}
                  className="card"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                  style={{ 
                    cursor: 'pointer', 
                    borderRadius: '16px',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  {/* Image Area */}
                  <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: `url(${asset.image}) center/cover no-repeat`, transition: 'transform 0.5s ease' }} className="asset-img-bg" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '0.25rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={10} color="var(--c-text-secondary)" /> {asset.plant}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-text)', margin: 0, letterSpacing: '-0.01em' }}>{asset.tag}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)', margin: 0, marginTop: '0.1rem' }}>{asset.type}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(asset.status), boxShadow: `0 0 0 2px rgba(255,255,255,0.8), 0 0 8px ${getStatusColor(asset.status)}` }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: asset.status === 'Healthy' ? 'var(--c-success)' : asset.status === 'Warning' ? 'var(--c-warning)' : 'var(--c-danger)' }}>{asset.status}</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--c-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        View Details <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '1px solid var(--c-border)', color: 'var(--c-text-secondary)', fontSize: '0.85rem' }}>
              <span>Showing 1-{filteredAssets.length} of 247 Assets</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px' }}><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /></button>
                <span style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-primary)', color: '#fff', borderRadius: '8px', fontWeight: 600 }}>1</span>
                <span style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>2</span>
                <span style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>3</span>
                <span style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>4</span>
                <button className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '8px' }}><ChevronRight size={16} /></button>
              </div>
            </div>

          </motion.div>
        </main>

        {/* Slide-out Detail Panel */}
        <AnimatePresence>
          {selectedAsset && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => { setSelectedAsset(null); setIsEditingAsset(false); }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', zIndex: 100 }} 
              />
              
              {/* Panel */}
              <motion.div 
                initial={{ x: '100%', opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ 
                  position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', 
                  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', 
                  boxShadow: '-8px 0 32px rgba(0,0,0,0.08)', zIndex: 101,
                  display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }}
              >
                {/* Panel Header */}
                <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{isEditingAsset ? 'Edit Asset' : 'Asset Details'}</h2>
                  <button 
                    onClick={() => { setSelectedAsset(null); setIsEditingAsset(false); }}
                    style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Panel Content (Scrollable) */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                  <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: `url(${selectedAsset.image}) center/cover no-repeat` }} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, marginRight: '1rem' }}>
                      {isEditingAsset ? (
                        <>
                          <input type="text" value={selectedAsset.tag} onChange={(e) => setSelectedAsset({...selectedAsset, tag: e.target.value})} style={{ fontSize: '1.5rem', fontWeight: 700, width: '100%', marginBottom: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--c-border)', outline: 'none' }} />
                          <input type="text" value={selectedAsset.type} onChange={(e) => setSelectedAsset({...selectedAsset, type: e.target.value})} style={{ fontSize: '0.95rem', width: '100%', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--c-border)', outline: 'none' }} />
                        </>
                      ) : (
                        <>
                          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>{selectedAsset.tag}</h1>
                          <div style={{ color: 'var(--c-text-secondary)', fontSize: '0.95rem' }}>{selectedAsset.type} • {selectedAsset.plant}</div>
                        </>
                      )}
                    </div>
                    <div style={{ padding: '0.4rem 0.8rem', borderRadius: '99px', background: selectedAsset.status === 'Healthy' ? 'rgba(34,197,94,0.1)' : selectedAsset.status === 'Warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: getStatusColor(selectedAsset.status), fontSize: '0.85rem', fontWeight: 600 }}>
                      {selectedAsset.status}
                    </div>
                  </div>

                  {isEditingAsset ? (
                    <textarea value={selectedAsset.description} onChange={(e) => setSelectedAsset({...selectedAsset, description: e.target.value})} style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--c-border)', marginBottom: '2rem', outline: 'none', resize: 'vertical' }} />
                  ) : (
                    <p style={{ color: 'var(--c-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                      {selectedAsset.description}
                    </p>
                  )}

                  <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-text-muted)', marginBottom: '1rem', fontWeight: 600 }}>Live Telemetry</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-text-muted)', marginBottom: '0.5rem' }}>
                        <Thermometer size={14} /> <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>TEMP</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedAsset.temp}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-text-muted)', marginBottom: '0.5rem' }}>
                        <Activity size={14} /> <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>VIBRATION</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedAsset.vibration}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-text-muted)', marginBottom: '0.5rem' }}>
                        <Droplets size={14} /> <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>PRESSURE</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedAsset.pressure}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-text-muted)', marginBottom: '0.5rem' }}>
                        <Zap size={14} /> <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>POWER</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>45 kW</div>
                    </div>
                  </div>

                </div>

                {/* Panel Footer */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'var(--c-surface)', display: 'flex', gap: '1rem' }}>
                  {isEditingAsset ? (
                    <>
                      <button className="btn btn-secondary" onClick={() => setIsEditingAsset(false)} style={{ flex: 1, padding: '0.85rem' }}>Cancel</button>
                      <button className="btn btn-primary" onClick={handleSaveEdit} style={{ flex: 1, padding: '0.85rem', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>Save Changes</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: '0.85rem' }}>View History</button>
                      <button className="btn btn-primary" onClick={() => setIsEditingAsset(true)} style={{ flex: 1, padding: '0.85rem', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>Edit Asset</button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* Register Asset Modal */}
          {isRegisterModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsRegisterModalOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 200 }} 
              />
              
              {/* Modal Wrapper for Centering */}
              <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 201, pointerEvents: 'none' }}>
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  style={{ 
                    width: '100%', maxWidth: '440px', background: 'var(--c-surface)', 
                    borderRadius: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    overflow: 'hidden', pointerEvents: 'auto'
                  }}
                >
                <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Register New Asset</h2>
                  <button 
                    onClick={() => setIsRegisterModalOpen(false)}
                    style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleRegisterAsset} style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)', marginBottom: '0.5rem' }}>Equipment Tag</label>
                    <input 
                      type="text" 
                      required
                      value={newAssetForm.tag}
                      onChange={(e) => setNewAssetForm({...newAssetForm, tag: e.target.value})}
                      placeholder="e.g. Pump-X44"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--c-border)', background: 'rgba(0,0,0,0.02)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)', marginBottom: '0.5rem' }}>Equipment Type</label>
                    <select 
                      value={newAssetForm.type}
                      onChange={(e) => setNewAssetForm({...newAssetForm, type: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--c-border)', background: 'rgba(0,0,0,0.02)', outline: 'none', appearance: 'none' }}
                    >
                      <option value="Boiler">Boiler</option>
                      <option value="Pump">Pump</option>
                      <option value="Conveyor">Conveyor</option>
                      <option value="Motor">Motor</option>
                      <option value="Compressor">Compressor</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)', marginBottom: '0.5rem' }}>Plant Location</label>
                    <select 
                      value={newAssetForm.plant}
                      onChange={(e) => setNewAssetForm({...newAssetForm, plant: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--c-border)', background: 'rgba(0,0,0,0.02)', outline: 'none', appearance: 'none' }}
                    >
                      <option value="Plant A">Plant A</option>
                      <option value="Plant B">Plant B</option>
                      <option value="Plant C">Plant C</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)', marginBottom: '0.5rem' }}>Asset Image</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '12px', border: '1px solid var(--c-border)', background: 'rgba(0,0,0,0.02)', outline: 'none', fontSize: '0.85rem' }}
                    />
                    {newAssetForm.imagePreview && (
                      <div style={{ marginTop: '0.75rem', height: '120px', borderRadius: '8px', background: `url(${newAssetForm.imagePreview}) center/cover no-repeat` }} />
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 8px 24px rgba(37,99,235,0.25)' }}>
                    Register Asset
                  </button>
                </form>
              </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
