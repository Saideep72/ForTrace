import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronRight, Plus, X, Activity, Thermometer, Droplets, Zap, 
  MapPin, ChevronDown, FileText, Image as ImageIcon, UploadCloud, FolderOpen,
  ArrowRight, ShieldAlert, Download, Factory, User
} from 'lucide-react';
import HeaderBar from '../components/HeaderBar';

import { apiFetch } from '../utils';

// --- MOCK DATA ---
const MOCK_ASSETS = [
  { id: 1, tag: 'Boiler-03', type: 'Boiler', status: 'Healthy', plant: 'Plant A', image: '/machines/machine1.jpg', description: 'High-pressure steam boiler unit for primary heating. Operating at optimal efficiency.', temp: '145°C', pressure: '4.2 bar', vibration: '0.8 mm/s' },
  { id: 2, tag: 'Pump-A12', type: 'Pump', status: 'Warning', plant: 'Plant B', image: '/machines/machine2.jpg', description: 'Centrifugal pump for coolant circulation. Slight vibration anomaly detected.', temp: '82°C', pressure: '2.1 bar', vibration: '3.4 mm/s' },
  { id: 3, tag: 'Conveyor-2', type: 'Conveyor', status: 'Critical', plant: 'Plant A', image: '/machines/machine3.jpg', description: 'Main assembly line transport conveyor. Immediate attention required.', temp: '105°C', pressure: 'N/A', vibration: '8.2 mm/s' },
  { id: 4, tag: 'Motor-07', type: 'Motor', status: 'Healthy', plant: 'Plant C', image: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=800&q=80', description: 'Heavy-duty induction motor for crusher unit. Recent maintenance performed.', temp: '60°C', pressure: 'N/A', vibration: '1.2 mm/s' }
];

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

const DOC_TYPES = ['OEM_MANUAL', 'INSPECTION_REPORT', 'WORK_ORDER', 'SOP', 'REGULATORY_FILING', 'INCIDENT_REPORT', 'P&ID', 'LESSONS_LEARNED'];

const getStatusColor = (status) => {
  if (status === 'Healthy') return 'var(--c-success)';
  if (status === 'Warning') return 'var(--c-warning)';
  if (status === 'Critical') return 'var(--c-danger)';
  return 'var(--c-text-muted)';
};

// --- ANIMATION VARIANTS ---
const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};
const cardVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function OperationsCenter() {
  const navigate = useNavigate();
  
  // Layout States
  const [activeTab, setActiveTab] = useState('operations');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // --- ASSET REGISTRY STATES ---
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [isAssetLoading, setIsAssetLoading] = useState(true);
  const [isEditingAsset, setIsEditingAsset] = useState(false);
  const [newAssetForm, setNewAssetForm] = useState({ tag: '', type: 'Boiler', plant: 'Plant A', imagePreview: '' });

  // --- DOCUMENTS STATES ---
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedDocAsset, setSelectedDocAsset] = useState(null);

  // --- REPORTS STATES ---
  const [currentReportTab, setCurrentReportTab] = useState('rca');
  const [rcaData, setRcaData] = useState([]);
  const [engChangesData, setEngChangesData] = useState([]);
  const [auditLogsData, setAuditLogsData] = useState([]);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ docType: 'OEM_MANUAL', file: null, description: '' });

  // --- EFFECTS ---
  useEffect(() => {
    // Load Assets
    async function loadAssets() {
      try {
        const result = await apiFetch('assets/', { params: { limit: 100, offset: 0 } });
        const mappedAssets = (result.data || []).map(a => ({
          id: a.id, tag: a.equipment_tag || `Asset-${a.id}`, type: a.equipment_type || 'Equipment',
          status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Healthy',
          plant: a.manufacturer || 'Main Plant', image: a.image_url || MOCK_ASSETS[0].image,
          description: `Industrial ${a.equipment_type} unit.`, temp: 'N/A', pressure: 'N/A', vibration: 'N/A'
        }));
        setAssets(mappedAssets.length > 0 ? mappedAssets : MOCK_ASSETS);
      } catch (err) {
        setAssets(MOCK_ASSETS);
      } finally {
        setIsAssetLoading(false);
      }
    }
    loadAssets();
  }, []);

  useEffect(() => {
    // Load Reports
    setIsReportLoading(true);
    setTimeout(() => {
      if (currentReportTab === 'rca') {
        setRcaData([
          { id: 'FAIL-1002', asset: 'Pump 03 (P-03)', date: '2026-07-15', status: 'Completed', trigger: 'Vibration Anomaly' },
          { id: 'FAIL-0988', asset: 'Compressor B', date: '2026-07-10', status: 'Completed', trigger: 'Overheating' },
        ]);
      } else if (currentReportTab === 'eng') {
        setEngChangesData([
          { id: 'EC-502', title: 'Update P-03 Impeller Spec', date: '2026-07-16', author: 'S. Patel', status: 'Approved' },
          { id: 'EC-499', title: 'Revise Temp Thresholds (Comp-B)', date: '2026-07-11', author: 'A. Kumar', status: 'Implemented' }
        ]);
      } else if (currentReportTab === 'audit') {
        setAuditLogsData([
          { id: 'AL-9021', user: 'j.doe', action: 'Downloaded RCA (FAIL-1002)', timestamp: '2026-07-17 14:30:00' },
          { id: 'AL-9020', user: 'system', action: 'Automated DB Backup', timestamp: '2026-07-17 00:00:00' }
        ]);
      }
      setIsReportLoading(false);
    }, 600);
  }, [currentReportTab]);

  // --- HANDLERS ---
  const filteredAssets = assets.filter(a => a.tag.toLowerCase().includes(assetSearchQuery.toLowerCase()) || a.type.toLowerCase().includes(assetSearchQuery.toLowerCase()));
  const filteredDocAssets = ASSETS_WITH_DOCS.filter(a => a.name.toLowerCase().includes(docSearchQuery.toLowerCase()));

  const handleRegisterAsset = (e) => {
    e.preventDefault();
    if (!newAssetForm.tag.trim()) return;
    const newAsset = { id: Date.now(), tag: newAssetForm.tag, type: newAssetForm.type, status: 'Healthy', plant: newAssetForm.plant, image: newAssetForm.imagePreview || MOCK_ASSETS[0].image, description: 'Newly registered asset.', temp: 'N/A', pressure: 'N/A', vibration: 'N/A' };
    setAssets([newAsset, ...assets]);
    setIsRegisterModalOpen(false);
    setNewAssetForm({ tag: '', type: 'Boiler', plant: 'Plant A', imagePreview: '' });
  };

  const handleDownloadRCA = (failureId) => {
    const blob = new Blob(['Mock PDF Content for RCA ' + failureId], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `RCA_Report_${failureId}.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>

      
      <main className="main-content font-inter">
        <HeaderBar />
        
        {/* Main Content Container */}
        <div className="p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Header Area */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-[var(--c-text)] tracking-tight mb-3">Operations Center</h1>
              <p className="text-[var(--c-text-secondary)] font-medium max-w-2xl mx-auto">Unified command interface for asset telemetry, technical documentation, and compliance reporting across Plant Alpha.</p>
            </div>

            {/* ==================== SECTION 1: ASSET REGISTRY ==================== */}
            <motion.section variants={sectionVariants} initial="initial" animate="animate" id="assets-section">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--c-text)]">Asset Registry</h2>
                  <p className="text-sm text-[var(--c-text-muted)]">Live telemetry and status monitoring</p>
                </div>
                <button onClick={() => setIsRegisterModalOpen(true)} className="px-5 py-2.5 rounded-full bg-[var(--c-primary)] text-white text-sm font-semibold hover:bg-[var(--c-secondary)] transition-all flex items-center gap-2 shadow-md">
                  <Plus size={16} /> Register Asset
                </button>
              </div>

              {/* Asset Filter Bar */}
              <div className="flex items-center gap-3 bg-[var(--c-surface)] p-2 rounded-full border border-[var(--c-border)] shadow-sm mb-6 w-max mx-auto">
                <div className="relative w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)]" />
                  <input 
                    type="text" placeholder="Search tag or type..." value={assetSearchQuery} onChange={(e) => setAssetSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-transparent border-none outline-none text-sm font-medium"
                  />
                </div>
                {['Type', 'Status', 'Plant'].map(filter => (
                  <button key={filter} className="px-4 py-2 text-sm font-semibold text-[var(--c-text-secondary)] hover:bg-[var(--c-bg)] rounded-full transition-colors flex items-center gap-1">
                    {filter} <ChevronRight size={14} className="rotate-90" />
                  </button>
                ))}
              </div>

              {/* Asset Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAssets.slice(0, 4).map((asset) => (
                  <motion.div key={asset.id} variants={cardVariants} onClick={() => setSelectedAsset(asset)} className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group">
                    <div className="h-40 relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${asset.image})` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 text-gray-800">
                        <MapPin size={12} /> {asset.plant}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-[var(--c-text)] leading-tight">{asset.tag}</h3>
                      <p className="text-sm text-[var(--c-text-secondary)] mb-4">{asset.type}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: getStatusColor(asset.status), boxShadow: `0 0 8px ${getStatusColor(asset.status)}` }} />
                        <span className="text-sm font-bold" style={{ color: getStatusColor(asset.status) }}>{asset.status}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Cinematic Divider */}
            <div className="flex items-center justify-center py-4">
              <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-[var(--c-border)] to-transparent"></div>
            </div>

            {/* ==================== SECTION 2: DOCUMENTS ==================== */}
            <motion.section variants={sectionVariants} initial="initial" animate="animate" id="documents-section">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[var(--c-text)]">Technical Documentation</h2>
                <p className="text-sm text-[var(--c-text-muted)]">Manuals, schematics, and P&ID diagrams</p>
              </div>

              <div className="flex h-[600px] bg-[var(--c-surface)] border border-[var(--c-border)] rounded-3xl shadow-sm overflow-hidden">
                {/* Left Panel: Doc Asset List */}
                <div className="w-1/3 border-r border-[var(--c-border)] flex flex-col bg-[var(--c-bg)]/30">
                  <div className="p-4 border-b border-[var(--c-border)]">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)]" />
                      <input 
                        type="text" placeholder="Search Assets..." value={docSearchQuery} onChange={(e) => setDocSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl outline-none text-sm font-medium focus:border-[var(--c-primary)]"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {filteredDocAssets.map(asset => (
                      <div key={asset.id} onClick={() => setSelectedDocAsset(asset)} className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${selectedDocAsset?.id === asset.id ? 'border-[var(--c-primary)] bg-[var(--c-primary)]/5' : 'border-transparent hover:bg-[var(--c-surface)] hover:border-[var(--c-border)]'}`}>
                        <div>
                          <div className="font-bold text-[var(--c-text)]">{asset.name}</div>
                          <div className="text-xs text-[var(--c-text-muted)] flex items-center gap-1.5 mt-1"><FolderOpen size={12}/> {asset.docCount} Documents</div>
                        </div>
                        <ChevronRight size={16} className={selectedDocAsset?.id === asset.id ? 'text-[var(--c-primary)]' : 'text-[var(--c-text-muted)]'}/>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right Panel: Doc Details */}
                <div className="flex-1 flex flex-col bg-[var(--c-surface)] relative">
                  {!selectedDocAsset ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-[var(--c-bg)] border border-[var(--c-border)] flex items-center justify-center mb-4 text-[var(--c-text-muted)]"><FolderOpen size={32}/></div>
                      <h3 className="text-xl font-bold text-[var(--c-text)]">No Asset Selected</h3>
                      <p className="text-[var(--c-text-secondary)] mt-2">Select an asset from the list to view its documents.</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="p-6 border-b border-[var(--c-border)] flex justify-between items-center bg-[var(--c-bg)]/30">
                        <div>
                          <h3 className="text-2xl font-bold text-[var(--c-text)]">{selectedDocAsset.name}</h3>
                          <p className="text-sm font-semibold text-[var(--c-text-secondary)] mt-1">{selectedDocAsset.type} • {selectedDocAsset.status}</p>
                        </div>
                        <button className="px-5 py-2.5 rounded-full bg-[var(--c-primary)] text-white text-sm font-semibold shadow-md flex items-center gap-2 hover:bg-[var(--c-secondary)] transition-colors">
                          <UploadCloud size={16}/> Upload File
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {MOCK_DOCS.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--c-border)] hover:border-[var(--c-primary)]/50 transition-colors bg-[var(--c-bg)]/50 cursor-pointer group">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${doc.type==='document' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                {doc.type === 'document' ? <FileText size={20}/> : <ImageIcon size={20}/>}
                              </div>
                              <div>
                                <div className="font-bold text-[var(--c-text)] group-hover:text-[var(--c-primary)] transition-colors">{doc.name}</div>
                                <div className="text-xs font-semibold text-[var(--c-text-muted)] mt-1">{doc.date} • {doc.size}</div>
                              </div>
                            </div>
                            <button className="p-2 rounded-full hover:bg-[var(--c-surface)] text-[var(--c-text-secondary)] border border-transparent hover:border-[var(--c-border)] transition-all">
                              <Download size={16}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Cinematic Divider */}
            <div className="flex items-center justify-center py-4">
              <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-[var(--c-border)] to-transparent"></div>
            </div>

            {/* ==================== SECTION 3: REPORTS CENTER ==================== */}
            <motion.section variants={sectionVariants} initial="initial" animate="animate" id="reports-section" className="pb-20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--c-text)]">Reports Center</h2>
                  <p className="text-sm text-[var(--c-text-muted)]">Compliance, engineering changes, and incident logs</p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text-secondary)] px-3 py-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <User size={16} className="text-purple-500"/> Manager
                  </div>
                  <button onClick={() => setIsUploadModalOpen(true)} className="px-5 py-2 rounded-full border border-[var(--c-primary)] text-[var(--c-primary)] text-sm font-bold hover:bg-[var(--c-primary)] hover:text-white transition-colors flex items-center gap-2">
                    <UploadCloud size={16}/> Submit Report
                  </button>
                </div>
              </div>

              <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-3xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-3 border-b border-[var(--c-border)]">
                  <button onClick={() => setCurrentReportTab('rca')} className={`p-6 text-left transition-colors flex flex-col justify-center ${currentReportTab === 'rca' ? 'bg-[var(--c-primary)]/5 border-b-2 border-b-[var(--c-primary)]' : 'hover:bg-[var(--c-bg)]'}`}>
                    <div className="flex items-center gap-2 text-[var(--c-text-secondary)] font-bold text-sm uppercase tracking-wider mb-2"><Activity size={16} className={currentReportTab==='rca'?'text-[var(--c-primary)]':''}/> RCA Reports</div>
                    <div className="text-3xl font-extrabold text-[var(--c-text)]">14</div>
                  </button>
                  <button onClick={() => setCurrentReportTab('eng')} className={`p-6 text-left border-l border-[var(--c-border)] transition-colors flex flex-col justify-center ${currentReportTab === 'eng' ? 'bg-[var(--c-primary)]/5 border-b-2 border-b-[var(--c-primary)]' : 'hover:bg-[var(--c-bg)]'}`}>
                    <div className="flex items-center gap-2 text-[var(--c-text-secondary)] font-bold text-sm uppercase tracking-wider mb-2"><FileText size={16} className={currentReportTab==='eng'?'text-[var(--c-primary)]':''}/> Eng. Changes</div>
                    <div className="text-3xl font-extrabold text-[var(--c-text)]">38</div>
                  </button>
                  <button onClick={() => setCurrentReportTab('audit')} className={`p-6 text-left border-l border-[var(--c-border)] transition-colors flex flex-col justify-center ${currentReportTab === 'audit' ? 'bg-[var(--c-primary)]/5 border-b-2 border-b-[var(--c-primary)]' : 'hover:bg-[var(--c-bg)]'}`}>
                    <div className="flex items-center gap-2 text-[var(--c-text-secondary)] font-bold text-sm uppercase tracking-wider mb-2"><ShieldAlert size={16} className={currentReportTab==='audit'?'text-[var(--c-primary)]':''}/> Audit Logs</div>
                    <div className="text-3xl font-extrabold text-[var(--c-text)]">126</div>
                  </button>
                </div>

                <div className="p-6 h-[400px] overflow-y-auto">
                  {isReportLoading ? (
                    <div className="h-full flex items-center justify-center text-[var(--c-text-muted)]"><div className="w-8 h-8 border-4 border-[var(--c-border)] border-t-[var(--c-primary)] rounded-full animate-spin"></div></div>
                  ) : (
                    <>
                      {currentReportTab === 'rca' && (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-[var(--c-border)] text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-wider">
                              <th className="pb-3">Failure ID</th><th className="pb-3">Asset</th><th className="pb-3">Trigger</th><th className="pb-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rcaData.map((row) => (
                              <tr key={row.id} className="border-b border-[var(--c-border)] last:border-0 hover:bg-[var(--c-bg)]">
                                <td className="py-4 font-bold">{row.id}</td><td className="py-4 text-sm text-[var(--c-text-secondary)]">{row.asset}</td><td className="py-4 text-sm text-[var(--c-text-secondary)]">{row.trigger}</td>
                                <td className="py-4 text-right">
                                  <button onClick={() => handleDownloadRCA(row.id)} className="px-3 py-1.5 rounded-full border border-[var(--c-primary)] text-[var(--c-primary)] text-xs font-bold hover:bg-[var(--c-primary)] hover:text-white transition-colors">Download</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      
                      {currentReportTab === 'eng' && (
                        <div className="space-y-3">
                          {engChangesData.map((row) => (
                            <div key={row.id} className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-bg)] flex justify-between items-center">
                              <div>
                                <div className="font-bold text-[var(--c-text)] text-sm">{row.id}: {row.title}</div>
                                <div className="text-xs text-[var(--c-text-muted)] mt-1 font-medium">Author: {row.author} • Date: {row.date}</div>
                              </div>
                              <span className="text-xs font-bold px-2.5 py-1 bg-[var(--c-surface)] rounded text-[var(--c-text-secondary)] border border-[var(--c-border)]">{row.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {currentReportTab === 'audit' && (
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-[var(--c-border)] text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-wider">
                              <th className="pb-3 w-32">Log ID</th><th className="pb-3 w-40">User</th><th className="pb-3">Action</th><th className="pb-3 text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditLogsData.map((row) => (
                              <tr key={row.id} className="border-b border-[var(--c-border)] hover:bg-[var(--c-bg)]">
                                <td className="py-3 font-mono text-[var(--c-text-secondary)]">{row.id}</td><td className="py-3 font-medium text-[var(--c-text)]">{row.user}</td>
                                <td className="py-3 text-[var(--c-text-secondary)]">{row.action}</td><td className="py-3 text-[var(--c-text-muted)] font-mono text-right">{row.timestamp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </main>
      
      {/* --- MODALS (Registry & Reports) --- */}
      {/* Registry Asset Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-[var(--c-surface)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--c-border)]">
              <div className="p-6 border-b border-[var(--c-border)] flex justify-between items-center"><h2 className="text-xl font-bold">Register Asset</h2><button onClick={()=>setIsRegisterModalOpen(false)}><X size={20}/></button></div>
              <form onSubmit={handleRegisterAsset} className="p-6 space-y-4">
                <div><label className="text-sm font-semibold text-[var(--c-text-secondary)] mb-1 block">Equipment Tag</label><input type="text" required value={newAssetForm.tag} onChange={(e) => setNewAssetForm({...newAssetForm, tag: e.target.value})} className="w-full p-2 border rounded-lg bg-[var(--c-bg)] outline-none" placeholder="e.g. Pump-X44"/></div>
                <button type="submit" className="w-full py-3 mt-4 rounded-xl bg-[var(--c-primary)] text-white font-bold">Register</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Reports Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-[var(--c-surface)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--c-border)]">
              <div className="p-6 border-b border-[var(--c-border)] flex justify-between items-center"><h2 className="text-xl font-bold">Upload Document</h2><button onClick={()=>setIsUploadModalOpen(false)}><X size={20}/></button></div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-semibold text-[var(--c-text-secondary)] mb-1 block">Document Type</label>
                  <select value={uploadForm.docType} onChange={e=>setUploadForm({...uploadForm, docType: e.target.value})} className="w-full p-2 border rounded-lg bg-[var(--c-bg)] outline-none">
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="w-full h-32 border-2 border-dashed rounded-xl bg-[var(--c-bg)] flex flex-col items-center justify-center text-[var(--c-text-muted)]">
                  <UploadCloud size={32} className="mb-2"/> <span className="text-sm font-bold">Click to browse or drag and drop</span>
                </div>
              </div>
              <div className="p-6 border-t border-[var(--c-border)] bg-[var(--c-bg)]/50 flex justify-end gap-3">
                <button onClick={() => setIsUploadModalOpen(false)} className="px-5 py-2 rounded-full font-bold">Cancel</button>
                <button onClick={() => setIsUploadModalOpen(false)} className="px-5 py-2 rounded-full bg-[var(--c-primary)] text-white font-bold">Upload & Process</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Slide-out Panel */}
      <AnimatePresence>
          {selectedAsset && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAsset(null)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[var(--c-surface)] shadow-2xl z-50 flex flex-col">
                <div className="p-6 border-b border-[var(--c-border)] flex justify-between items-center">
                  <h2 className="text-xl font-bold">Asset Details</h2>
                  <button onClick={() => setSelectedAsset(null)} className="p-2 rounded-full bg-[var(--c-bg)]"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="h-48 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${selectedAsset.image})` }} />
                  <div>
                    <div className="flex justify-between items-start">
                      <h1 className="text-3xl font-extrabold">{selectedAsset.tag}</h1>
                      <div className="px-3 py-1 rounded-full text-sm font-bold bg-[var(--c-bg)]" style={{ color: getStatusColor(selectedAsset.status) }}>{selectedAsset.status}</div>
                    </div>
                    <p className="text-[var(--c-text-secondary)] font-semibold mt-1">{selectedAsset.type} • {selectedAsset.plant}</p>
                  </div>
                  <p className="text-[var(--c-text-secondary)] leading-relaxed">{selectedAsset.description}</p>
                  
                  <h3 className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Live Telemetry</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--c-bg)] rounded-xl border border-[var(--c-border)]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-muted)] mb-2"><Thermometer size={14}/> TEMP</div>
                      <div className="text-xl font-extrabold">{selectedAsset.temp}</div>
                    </div>
                    <div className="p-4 bg-[var(--c-bg)] rounded-xl border border-[var(--c-border)]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-muted)] mb-2"><Activity size={14}/> VIBRATION</div>
                      <div className="text-xl font-extrabold">{selectedAsset.vibration}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
      </AnimatePresence>
    </div>
  );
}