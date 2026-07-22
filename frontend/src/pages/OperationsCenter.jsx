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
  const [uploadForm, setUploadForm] = useState({ linkedAsset: '', title: '', categoryType: 'SOP', revision: '1.0', compliance: '', file: null });

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
        <div className="py-6 px-6 lg:py-10 lg:px-10">
          <div className="w-full space-y-16">



            {/* ==================== SECTION 1: ASSET REGISTRY ==================== */}
            <motion.section variants={sectionVariants} initial="initial" animate="animate" id="assets-section">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 w-full">
                {/* Left: Asset Filter Bar */}
                <div className="flex-grow lg:flex-1 flex justify-start pb-2 lg:pb-0">
                  <div className="relative w-full max-w-[280px]">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)]" />
                    <input
                      type="text" placeholder="Search tag or type..." value={assetSearchQuery} onChange={(e) => setAssetSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-full outline-none text-sm font-medium shadow-sm focus:border-[var(--c-primary)] transition-colors"
                    />
                  </div>
                </div>

                {/* Center: Capitalized, text-5xl Header */}
                <div className="flex-grow lg:flex-1 text-center py-2 lg:py-0">
                  <h2 className="text-5xl font-extrabold uppercase tracking-wider text-[var(--c-text)] whitespace-nowrap">
                    Asset Registry
                  </h2>
                </div>

                {/* Right: Register button */}
                <div className="flex-grow lg:flex-1 flex justify-end">
                  <button onClick={() => setIsRegisterModalOpen(true)} className="px-5 py-2.5 rounded-full bg-[var(--c-secondary)] text-white text-sm font-semibold hover:bg-[var(--c-tertiary)] transition-all flex items-center gap-2 shadow-md shrink-0 whitespace-nowrap">
                    <Plus size={16} /> Register Asset
                  </button>
                </div>
              </div>

              {/* Asset Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredAssets.slice(0, 3).map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    variants={cardVariants}
                    onClick={() => setSelectedAsset(asset)}
                    className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-[2rem] p-6 md:p-8 flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                    style={{ minHeight: '520px' }}
                  >
                    <div className="space-y-4">
                      {/* Subtitle Tagline */}
                      <div className="font-mono text-xs tracking-widest text-[var(--c-text-muted)] uppercase">
                        0{index + 1} &bull; {asset.type.toUpperCase()} &bull; {asset.plant.toUpperCase()}
                      </div>

                      {/* Bold Heading */}
                      <h3 className="font-bold text-xl md:text-2xl text-[var(--c-text)] leading-tight group-hover:text-[var(--c-secondary)] transition-colors">
                        {asset.tag}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[var(--c-text-secondary)] leading-relaxed">
                        {asset.description}
                      </p>
                    </div>

                    <div className="space-y-6 mt-6">
                      {/* Image under description */}
                      <div className="h-44 relative rounded-2xl overflow-hidden shadow-inner">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                          style={{ backgroundImage: `url(${asset.image})` }}
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 text-gray-800 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: getStatusColor(asset.status) }} />
                          {asset.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Full width button at the bottom */}
                      <button className="w-full py-3.5 rounded-xl bg-[var(--c-bg)] border border-[var(--c-border)] text-xs font-bold tracking-wider text-[var(--c-text-secondary)] hover:bg-[var(--c-secondary)] hover:text-white transition-all uppercase">
                        View Details
                      </button>
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
              <div className="mb-8 text-center">
                <h2 className="text-5xl font-extrabold uppercase tracking-wider text-[var(--c-text)]">Technical Documentation</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Interactive Inputs & Asset Selector */}
                <div className="lg:col-span-5 space-y-8 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-3xl p-6 md:p-8 shadow-sm">
                  <div className="space-y-2">
                    <span className="font-mono text-xs tracking-wider text-[var(--c-text-muted)] uppercase">Documentation Profiler</span>
                    <h3 className="text-2xl font-extrabold text-[var(--c-text)]">Tell us about your asset:</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Select Asset - Mockup Input Style */}
                    <div className="border-b border-[var(--c-border)] pb-2 space-y-1">
                      <label className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Select Target Asset</label>
                      <select
                        value={selectedDocAsset?.id || ''}
                        onChange={(e) => {
                          const asset = ASSETS_WITH_DOCS.find(a => a.id === e.target.value);
                          setSelectedDocAsset(asset || null);
                        }}
                        className="w-full bg-transparent border-none outline-none font-semibold text-[var(--c-text)] py-1.5 cursor-pointer"
                      >
                        <option value="">-- Choose Asset --</option>
                        {ASSETS_WITH_DOCS.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                        ))}
                      </select>
                    </div>

                    {/* Asset Details Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="border-b border-[var(--c-border)] pb-2 space-y-1">
                        <label className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Asset Class</label>
                        <div className="font-semibold text-[var(--c-text)] py-1.5">
                          {selectedDocAsset?.type || 'N/A'}
                        </div>
                      </div>
                      <div className="border-b border-[var(--c-border)] pb-2 space-y-1">
                        <label className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Status</label>
                        <div className="font-semibold py-1.5" style={{ color: selectedDocAsset ? getStatusColor(selectedDocAsset.status) : 'inherit' }}>
                          {selectedDocAsset?.status || 'N/A'}
                        </div>
                      </div>
                      <div className="border-b border-[var(--c-border)] pb-2 space-y-1">
                        <label className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Installed On</label>
                        <div className="font-semibold text-[var(--c-text)] py-1.5">
                          {selectedDocAsset?.installed || 'N/A'}
                        </div>
                      </div>
                      <div className="border-b border-[var(--c-border)] pb-2 space-y-1">
                        <label className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Associated Docs</label>
                        <div className="font-semibold text-[var(--c-text)] py-1.5">
                          {selectedDocAsset?.docCount || 0} Files
                        </div>
                      </div>
                    </div>

                    {/* Document Search / Filter - Mockup Input Style */}
                    <div className="border-b border-[var(--c-border)] pb-2 space-y-1">
                      <label className="text-[10px] font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Filter by Keyword</label>
                      <input
                        type="text"
                        placeholder="e.g. Manual, SOP..."
                        value={docSearchQuery}
                        onChange={(e) => setDocSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-semibold text-[var(--c-text)] py-1.5 placeholder:text-[var(--c-text-muted)]"
                      />
                    </div>


                  </div>
                </div>

                {/* Right Column: Premium Dark Folder Panel with exact mockup shape */}
                <div className="lg:col-span-7 flex flex-col">
                  <div
                    style={{
                      clipPath: 'polygon(0% 6%, 2% 0%, 35% 0%, 40% 6%, 97% 6%, 100% 9%, 100% 95%, 97% 100%, 3% 100%, 0% 95%, 0% 55%, 1.5% 52%, 1.5% 48%, 0% 45%)',
                      background: 'var(--c-border)',
                      padding: '1px'
                    }}
                  >
                    <div
                      className="bg-gradient-to-br from-[var(--c-tertiary)] to-[#041e1b] p-6 md:p-8 flex flex-col justify-between text-white shadow-2xl"
                      style={{
                        clipPath: 'polygon(0% 6%, 2% 0%, 35% 0%, 40% 6%, 97% 6%, 100% 9%, 100% 95%, 97% 100%, 3% 100%, 0% 95%, 0% 55%, 1.5% 52%, 1.5% 48%, 0% 45%)',
                        minHeight: '550px'
                      }}
                    >

                      {!selectedDocAsset ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 pt-28">
                          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
                            <FolderOpen size={24} />
                          </div>
                          <h4 className="text-lg font-bold">Cabinet Empty</h4>
                          <p className="text-sm text-white/60 mt-1 max-w-xs">Select an asset from the left profile form to unlock the technical documentation folder.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col flex-1 justify-between pt-4">
                          <div className="space-y-6">
                            {/* Folder Header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-mono text-xs text-white/50 uppercase tracking-widest">{selectedDocAsset.name} &bull; Connected Folder</span>
                                <h4 className="text-2xl font-extrabold tracking-tight mt-1">ForTrace Digital Cabinet</h4>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-extrabold text-[var(--c-primary)] font-mono">{selectedDocAsset.docCount}</div>
                                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Stored Files</div>
                              </div>
                            </div>

                            <div className="border-t border-white/10 pt-4 space-y-4">
                              <span className="text-xs font-bold text-white/50 uppercase tracking-wider block">Indexed Documents List:</span>
                              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                                {MOCK_DOCS.map(doc => (
                                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-white/10 text-[var(--c-primary)]">
                                        <FileText size={16} />
                                      </div>
                                      <div>
                                        <div className="font-bold text-sm text-white group-hover:text-[var(--c-primary)] transition-colors">{doc.name}</div>
                                        <div className="text-[10px] font-semibold text-white/50 mt-0.5">{doc.date} &bull; {doc.size}</div>
                                      </div>
                                    </div>
                                    <button className="p-2 rounded-full hover:bg-white/10 text-white/70 border border-transparent transition-all">
                                      <Download size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Folder Bottom Form: Upload Zone */}
                          <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                              <div className="text-center md:text-left">
                                <div className="font-bold text-sm">Need to upload a new asset document?</div>
                                <div className="text-xs text-white/60 mt-0.5">Select a PDF file to upload to this folder context.</div>
                              </div>
                              <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="px-5 py-2.5 bg-white text-[var(--c-tertiary)] hover:bg-[var(--c-primary)] hover:text-white rounded-xl text-xs font-extrabold tracking-wider transition-all uppercase whitespace-nowrap"
                              >
                                Submit File
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

              </div>
            </motion.section>

            {/* Cinematic Divider */}
            <div className="flex items-center justify-center py-4">
              <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-[var(--c-border)] to-transparent"></div>
            </div>

            {/* ==================== SECTION 3: REPORTS CENTER ==================== */}
            <motion.section variants={sectionVariants} initial="initial" animate="animate" id="reports-section" className="pb-20">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <h2 className="text-5xl font-extrabold uppercase tracking-wider text-[var(--c-text)] text-center">Reports Center</h2>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text-secondary)] px-3 py-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)]">
                    <User size={16} className="text-purple-500" /> Manager
                  </div>
                  <button onClick={() => setIsUploadModalOpen(true)} className="px-5 py-2 rounded-full border border-[var(--c-primary)] text-[var(--c-primary)] text-sm font-bold hover:bg-[var(--c-primary)] hover:text-white transition-colors flex items-center gap-2">
                    <UploadCloud size={16} /> Submit Report
                  </button>
                </div>
              </div>

              {/* Scroll-Triggered Card Container with Curved Edges */}
              <motion.div
                initial={{ y: 150, opacity: 0, scale: 0.95 }}
                whileInView={{ y: 0, opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  type: "spring",
                  stiffness: 45,
                  damping: 15,
                  mass: 1.2
                }}
                className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-[24px] md:rounded-[32px] -mx-4 lg:-mx-8 overflow-hidden shadow-2xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[var(--c-border)] bg-[#1e3a3a] text-white overflow-hidden">

                  {/* Column 1: Methodology Title */}
                  <div className="p-8 flex flex-col justify-between min-h-[140px] text-left">
                    <span className="font-mono text-[10px] tracking-wider text-white/50 uppercase">Methodology</span>
                    <h3 className="text-xl font-bold text-white mt-4 leading-snug">
                      This report draws from
                    </h3>
                  </div>

                  {/* Column 2: Tab RCA */}
                  <button
                    onClick={() => setCurrentReportTab('rca')}
                    className={`p-8 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between items-start text-left transition-all hover:bg-white/5 outline-none ${currentReportTab === 'rca' ? 'bg-white/5' : ''}`}
                    style={{ minHeight: '140px' }}
                  >
                    <span className={`text-5xl md:text-6xl font-extrabold font-mono transition-colors ${currentReportTab === 'rca' ? 'text-[var(--c-primary)]' : 'text-white'}`}>
                      14
                    </span>
                    <span className="text-xs font-semibold tracking-wide text-white/70 uppercase mt-4">
                      RCA Reports
                    </span>
                  </button>

                  {/* Column 3: Tab Eng. Changes */}
                  <button
                    onClick={() => setCurrentReportTab('eng')}
                    className={`p-8 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between items-start text-left transition-all hover:bg-white/5 outline-none ${currentReportTab === 'eng' ? 'bg-white/5' : ''}`}
                    style={{ minHeight: '140px' }}
                  >
                    <span className={`text-5xl md:text-6xl font-extrabold font-mono transition-colors ${currentReportTab === 'eng' ? 'text-[var(--c-primary)]' : 'text-white'}`}>
                      38
                    </span>
                    <span className="text-xs font-semibold tracking-wide text-white/70 uppercase mt-4">
                      Eng. Changes
                    </span>
                  </button>

                  {/* Column 4: Tab Audit Logs */}
                  <button
                    onClick={() => setCurrentReportTab('audit')}
                    className={`p-8 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between items-start text-left transition-all hover:bg-white/5 outline-none ${currentReportTab === 'audit' ? 'bg-white/5' : ''}`}
                    style={{ minHeight: '140px' }}
                  >
                    <span className={`text-5xl md:text-6xl font-extrabold font-mono transition-colors ${currentReportTab === 'audit' ? 'text-[var(--c-primary)]' : 'text-white'}`}>
                      126+
                    </span>
                    <span className="text-xs font-semibold tracking-wide text-white/70 uppercase mt-4">
                      Audit Logs
                    </span>
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
              </motion.div>
            </motion.section>

          </div>
        </div>
      </main>

      {/* --- MODALS (Registry & Reports) --- */}
      {/* Registry Asset Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-[var(--c-surface)] rounded-xl shadow-2xl overflow-hidden border border-[var(--c-border)]">
              <div className="p-6 pb-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[var(--c-text)]">Register Asset</h2>
                  <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleRegisterAsset} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Equipment Tag</label>
                    <input type="text" required placeholder="e.g. Pump-X44" value={newAssetForm.tag} onChange={(e) => setNewAssetForm({ ...newAssetForm, tag: e.target.value })} className="w-full p-2 border border-[var(--c-border)] rounded-lg bg-[var(--c-bg)] text-[var(--c-text)] outline-none focus:border-[var(--c-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Equipment Type</label>
                    <div className="relative">
                      <select required value={newAssetForm.type} onChange={(e) => setNewAssetForm({ ...newAssetForm, type: e.target.value })} className="w-full p-2 border border-[var(--c-border)] rounded-lg bg-[var(--c-bg)] text-[var(--c-text)] outline-none appearance-none focus:border-[var(--c-primary)] transition-colors font-medium">
                        <option value="Boiler">Boiler</option>
                        <option value="Pump">Pump</option>
                        <option value="Conveyor">Conveyor</option>
                        <option value="Motor">Motor</option>
                        <option value="Compressor">Compressor</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Plant Location</label>
                    <div className="relative">
                      <select required value={newAssetForm.plant} onChange={(e) => setNewAssetForm({ ...newAssetForm, plant: e.target.value })} className="w-full p-2 border border-[var(--c-border)] rounded-lg bg-[var(--c-bg)] text-[var(--c-text)] outline-none appearance-none focus:border-[var(--c-primary)] transition-colors font-medium">
                        <option value="Plant A">Plant A</option>
                        <option value="Plant B">Plant B</option>
                        <option value="Plant C">Plant C</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Upload Asset Image</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setNewAssetForm({ ...newAssetForm, imagePreview: previewUrl });
                      }
                    }} className="w-full text-sm text-[var(--c-text-secondary)] file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-[var(--c-border)] file:bg-[var(--c-surface)] file:text-[var(--c-text)] file:font-semibold hover:file:bg-[var(--c-bg)] cursor-pointer" />
                  </div>
                  <div className="pt-2 pb-4">
                    <button type="submit" className="w-full py-2.5 rounded-lg bg-[var(--c-primary)] hover:bg-[var(--c-secondary)] text-white font-bold transition-colors">Register</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-[var(--c-surface)] rounded-xl shadow-2xl overflow-hidden border border-[var(--c-border)]">
              <div className="p-6 pb-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[var(--c-text)]">Upload Document</h2>
                  <button onClick={() => setIsUploadModalOpen(false)} className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Linked Asset UAT</label>
                    <input type="text" placeholder="REF-HTX-E201-001" value={uploadForm.linkedAsset} onChange={e => setUploadForm({ ...uploadForm, linkedAsset: e.target.value })} className="w-full p-2 border border-[var(--c-border)] rounded-lg bg-[var(--c-bg)] text-[var(--c-text)] outline-none focus:border-[var(--c-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Document Title</label>
                    <input type="text" placeholder="Coolant Loop SOP" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} className="w-full p-2 border border-[var(--c-border)] rounded-lg bg-[var(--c-bg)] text-[var(--c-text)] outline-none focus:border-[var(--c-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Category Type</label>
                    <div className="relative">
                      <select value={uploadForm.categoryType} onChange={e => setUploadForm({ ...uploadForm, categoryType: e.target.value })} className="w-full p-2 border border-[var(--c-border)] rounded-lg bg-[var(--c-bg)] text-[var(--c-text)] outline-none appearance-none focus:border-[var(--c-primary)] transition-colors font-medium">
                        {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Revision Version</label>
                    <input type="text" placeholder="1.0" value={uploadForm.revision} onChange={e => setUploadForm({ ...uploadForm, revision: e.target.value })} className="w-full p-2 border border-[var(--c-border)] rounded-lg bg-[var(--c-bg)] text-[var(--c-text)] outline-none focus:border-[var(--c-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Compliance standard (comma-separated)</label>
                    <input type="text" placeholder="ISO_9001, OISD_144" value={uploadForm.compliance} onChange={e => setUploadForm({ ...uploadForm, compliance: e.target.value })} className="w-full p-2 border border-[var(--c-border)] rounded-lg bg-[var(--c-bg)] text-[var(--c-text)] outline-none focus:border-[var(--c-primary)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[var(--c-text-secondary)] mb-1 block">Select PDF/Audio File</label>
                    <input type="file" onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })} className="w-full text-sm text-[var(--c-text-secondary)] file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-[var(--c-border)] file:bg-[var(--c-surface)] file:text-[var(--c-text)] file:font-semibold hover:file:bg-[var(--c-bg)] cursor-pointer" accept=".pdf,audio/*" />
                  </div>
                </div>
              </div>
              <div className="p-6 pt-4">
                <button onClick={() => { console.log('Uploading:', uploadForm); setIsUploadModalOpen(false); }} className="w-full py-2.5 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white font-bold transition-colors">
                  Upload to Storage
                </button>
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
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-muted)] mb-2"><Thermometer size={14} /> TEMP</div>
                    <div className="text-xl font-extrabold">{selectedAsset.temp}</div>
                  </div>
                  <div className="p-4 bg-[var(--c-bg)] rounded-xl border border-[var(--c-border)]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-muted)] mb-2"><Activity size={14} /> VIBRATION</div>
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