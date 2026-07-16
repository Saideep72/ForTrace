import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, ChevronRight, FileText, 
  Image as ImageIcon, UploadCloud, FolderOpen,
  ArrowRight
} from 'lucide-react';

import HeaderBar from '../components/HeaderBar';
import SideNav from '../components/SideNav';

const ASSETS_WITH_DOCS = [
  { id: 'FT-BO-003', name: 'Boiler-03', type: 'Boiler', status: 'Healthy', docCount: 3, image: '/machines/machine1.jpg', installed: '12 Mar 2022' },
  { id: 'FT-PU-A12', name: 'Pump-A12', type: 'Pump', status: 'Warning', docCount: 5, image: '/machines/machine2.jpg', installed: '05 Jan 2023' },
  { id: 'FT-MO-007', name: 'Motor-07', type: 'Motor', status: 'Healthy', docCount: 1, image: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=800&q=80', installed: '14 Feb 2021' },
  { id: 'FT-CO-002', name: 'Conveyor-02', type: 'Conveyor', status: 'Critical', docCount: 8, image: '/machines/machine3.jpg', installed: '09 Nov 2020' }
];

const MOCK_DOCS = [
  { id: 1, name: 'Operation Manual.pdf', type: 'document', size: '2.4 MB', date: '12 May 2026' },
  { id: 2, name: 'Maintenance Report.pdf', type: 'document', size: '1.1 MB', date: '02 Jul 2026' },
  { id: 3, name: 'Warranty.pdf', type: 'document', size: '0.8 MB', date: '14 Mar 2022' },
  { id: 4, name: 'Equipment Schematic.png', type: 'image', size: '4.2 MB', date: '15 Mar 2022' }
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } }
};

const listVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, duration: 0.4 } }
};

const itemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 }
};

export default function Documents() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const filteredAssets = ASSETS_WITH_DOCS.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>
      <SideNav activeTab="documents" setActiveTab={() => {}} isCollapsed={isCollapsed} onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
      
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <HeaderBar />
        
        <motion.div initial="initial" animate="animate" variants={pageVariants} style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '1.5rem', gap: '1.5rem', background: 'var(--c-bg)' }}>
          
          {/* Left Panel: Master List */}
          <div className="card" style={{ width: '380px', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 1.25rem 0', letterSpacing: '-0.02em', color: 'var(--c-text)' }}>Documents</h1>
              
              {/* Filters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search Assets..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', background: 'rgba(0,0,0,0.03)', border: '1px solid transparent', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--c-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                    onBlur={(e) => { e.target.style.background = 'rgba(0,0,0,0.03)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--c-text-secondary)', fontWeight: 500 }}>
                    Asset Type <ChevronDown size={14} />
                  </button>
                  <button className="btn" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--c-text-secondary)', fontWeight: 500 }}>
                    Status <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Asset List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              <motion.div variants={listVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredAssets.map(asset => (
                  <motion.div 
                    key={asset.id} 
                    variants={itemVariants}
                    onClick={() => setSelectedAsset(asset)}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selectedAsset?.id === asset.id ? 'var(--c-primary)' : 'transparent',
                      background: selectedAsset?.id === asset.id ? 'rgba(37,99,235,0.04)' : 'transparent',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => { if(selectedAsset?.id !== asset.id) e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
                    onMouseLeave={(e) => { if(selectedAsset?.id !== asset.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '1rem', marginBottom: '0.2rem' }}>{asset.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--c-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FolderOpen size={12} /> {asset.docCount} Document{asset.docCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, 
                      color: selectedAsset?.id === asset.id ? 'var(--c-primary)' : 'var(--c-text-muted)' 
                    }}>
                      View <ArrowRight size={14} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right Panel: Detail View */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', background: 'var(--c-surface)' }}>
            
            <AnimatePresence mode="wait">
              {!selectedAsset ? (
                // Empty State
                <motion.div 
                  key="empty" 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}
                >
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--c-text-muted)' }}>
                    <FolderOpen size={36} strokeWidth={1.5} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem' }}>No asset selected</h2>
                  <p style={{ color: 'var(--c-text-secondary)', fontSize: '1rem', maxWidth: '300px', lineHeight: 1.5 }}>
                    Please select an asset from the list on the left to view its associated documents.
                  </p>
                </motion.div>
              ) : (
                // Selected Asset Documents
                <motion.div 
                  key={selectedAsset.id}
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                  {/* Right Panel Header */}
                  <div style={{ padding: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'linear-gradient(to right, rgba(37,99,235,0.03), transparent)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Selected Asset</div>
                      <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--c-border)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-text)' }}>
                        {selectedAsset.name} <ChevronDown size={18} color="var(--c-text-muted)" />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow)', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                        <ImageIcon size={16} /> Upload Image
                      </button>
                      <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, boxShadow: '0 8px 16px rgba(37,99,235,0.25)', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                        <UploadCloud size={16} /> Upload Document
                      </button>
                    </div>
                  </div>

                  {/* Asset Profile (Image + Info) */}
                  <div style={{ display: 'flex', gap: '2rem', padding: '2rem', borderBottom: '1px solid var(--c-border)' }}>
                    <div style={{ width: '220px', height: '150px', borderRadius: '12px', background: selectedAsset.image ? `url(${selectedAsset.image}) center/cover no-repeat` : 'rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      {!selectedAsset.image && (
                         <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-muted)' }}>
                           <ImageIcon size={48} opacity={0.3} />
                         </div>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                       <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--c-text)', letterSpacing: '-0.02em' }}>{selectedAsset.name}</h2>
                       <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', fontSize: '0.95rem', flex: 1 }}>
                          <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Type</div>
                          <div style={{ fontWeight: 600 }}>: {selectedAsset.type}</div>
                          
                          <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Status</div>
                          <div style={{ fontWeight: 600 }}>: <span style={{ color: selectedAsset.status === 'Healthy' ? 'var(--c-success)' : selectedAsset.status === 'Warning' ? 'var(--c-warning)' : 'var(--c-danger)' }}>{selectedAsset.status}</span></div>
                          
                          <div style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Installed</div>
                          <div style={{ fontWeight: 600 }}>: {selectedAsset.installed}</div>
                       </div>
                    </div>
                  </div>

                  {/* Document List */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px 100px', gap: '1rem', borderBottom: '1px solid var(--c-border)', paddingBottom: '1rem', marginBottom: '1rem', color: 'var(--c-text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <div>Document Name</div>
                      <div>Type</div>
                      <div>Added Date</div>
                      <div style={{ textAlign: 'right' }}>Size</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {MOCK_DOCS.map(doc => (
                        <div key={doc.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px 100px', gap: '1rem', alignItems: 'center', padding: '1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid transparent' }} className="doc-row" onMouseEnter={(e) => { e.currentTarget.style.background='rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor='rgba(0,0,0,0.05)' }} onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {doc.type === 'document' ? <FileText size={18} color="var(--c-primary)" /> : <ImageIcon size={18} color="var(--c-accent)" />}
                            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--c-text)' }}>{doc.name}</span>
                          </div>
                          <div>
                            {doc.type === 'document' ? (
                              <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(37,99,235,0.08)', color: 'var(--c-primary)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>PDF</span>
                            ) : (
                              <span style={{ padding: '0.25rem 0.6rem', background: 'rgba(245,158,11,0.08)', color: 'var(--c-accent)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>IMAGE</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)', fontWeight: 500 }}>
                            {doc.date}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', fontWeight: 500, textAlign: 'right' }}>
                            {doc.size}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
