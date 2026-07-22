import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, X, UploadCloud, FileText, Settings, Trash2, 
  ShieldCheck, AlertTriangle, Cpu, Tag, Calendar, Database,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { apiFetch, getUserRole } from '../utils';

// Unsplash high-resolution industrial category image mapper
const getDocCategoryImg = (docType) => {
  const images = {
    'SOP': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    'OEM_MANUAL': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    'PID': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
    'WORK_ORDER': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=600&q=80',
    'INSPECTION_REPORT': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    'INCIDENT_REPORT': 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=600&q=80',
    'LESSONS_LEARNED': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80'
  };
  return images[docType] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
};

const getStatusBadge = (docType) => {
  if (docType === 'INCIDENT_REPORT') {
    return { label: 'CRITICAL', colorClass: 'bg-red-500 text-white', dot: 'bg-red-200' };
  }
  if (['SOP', 'OEM_MANUAL', 'LESSONS_LEARNED'].includes(docType)) {
    return { label: 'HEALTHY', colorClass: 'bg-green-600 text-white', dot: 'bg-green-200' };
  }
  return { label: 'WARNING', colorClass: 'bg-amber-500 text-white', dot: 'bg-amber-200' };
};

export default function DocumentsDashboard() {
  const userRole = getUserRole();
  const isAllowedToUpload = ['Plant_Manager', 'Maintenance_Engineer', 'Admin'].includes(userRole);
  const isAllowedToDelete = ['Plant_Manager', 'Admin'].includes(userRole);

  // Listing / Search Filters States
  const [searchWord, setSearchWord] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Pagination State (6 items per page for 3x2 grid)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset to page 1 on search word change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchWord]);

  // Upload Form Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadUat, setUploadUat] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDocType, setUploadDocType] = useState('SOP');
  const [uploadRevision, setUploadRevision] = useState('1.0');
  const [uploadCompliance, setUploadCompliance] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ text: '', type: '' });

  // Details Modal States
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [entities, setEntities] = useState([]);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [detailsStatus, setDetailsStatus] = useState({ text: '', type: '' });

  // RAG Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUat, setSearchUat] = useState('');
  const [searchThreshold, setSearchThreshold] = useState(0.0);
  const [searchLimit, setSearchLimit] = useState(5);
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const data = await apiFetch('documents?limit=100');
      setDocuments(data.items || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadStatus({ text: 'Please select a file to upload.', type: 'error' });
      return;
    }

    setUploadStatus({ text: 'Uploading file bytes to storage...', type: 'info' });

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('uat', uploadUat.trim());
    formData.append('title', uploadTitle.trim());
    formData.append('doc_type', uploadDocType);
    formData.append('revision', uploadRevision.trim());
    if (uploadCompliance.trim()) {
      formData.append('compliance_scope', uploadCompliance.trim());
    }

    try {
      const data = await apiFetch('documents/upload', {
        method: 'POST',
        body: formData
      });
      
      setUploadStatus({ text: `Uploaded successfully! registered ID: ${data.doc_id}`, type: 'success' });
      
      // Clear forms
      setUploadUat('');
      setUploadTitle('');
      setUploadDocType('SOP');
      setUploadRevision('1.0');
      setUploadCompliance('');
      setUploadFile(null);
      
      // Delay closing modal slightly
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadStatus({ text: '', type: '' });
        fetchDocuments();
      }, 800);

    } catch (err) {
      setUploadStatus({ text: `Upload failed: ${err.message}`, type: 'error' });
    }
  };

  const handleOpenDetails = async (doc) => {
    setSelectedDoc(doc);
    setDetailsStatus({ text: '', type: '' });
    setEntities([]);
    setEntitiesLoading(true);
    try {
      const data = await apiFetch(`entities/document/${doc.doc_id}`);
      setEntities(data || []);
    } catch (err) {
      console.error("Failed to load document entities:", err);
    } finally {
      setEntitiesLoading(false);
    }
  };

  const handleProcessDoc = async (docId) => {
    setDetailsStatus({ text: 'Invoking OCR text extraction pipeline...', type: 'info' });
    try {
      const data = await apiFetch(`documents/process/${docId}`, { method: 'POST' });
      setDetailsStatus({ 
        text: `Extraction Succeeded! Parser: [${data.method_used}]. Created ${data.chunks_created} vectors. NER Spans: ${data.entities_extracted}.`, 
        type: 'success' 
      });
      // Reload entities list
      const entData = await apiFetch(`entities/document/${docId}`);
      setEntities(entData || []);
    } catch (err) {
      setDetailsStatus({ text: `Extraction failed: ${err.message}`, type: 'error' });
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!confirm('Are you sure you want to soft-delete this document?')) return;
    try {
      await apiFetch(`documents/${docId}`, { method: 'DELETE' });
      setSelectedDoc(null);
      fetchDocuments();
      alert('Document soft-deleted!');
    } catch (err) {
      alert(`Error deleting document: ${err.message}`);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setSearchStatus({ text: 'Executing cosine match calculations...', type: 'info' });
    setSearchResults([]);

    const params = {
      query: searchQuery,
      threshold: searchThreshold,
      limit: searchLimit
    };
    if (searchUat.trim()) {
      params.uat = searchUat.trim();
    }

    try {
      const data = await apiFetch('search/semantic', {
        method: 'POST',
        params
      });
      setSearchResults(data || []);
      setSearchStatus({ text: `Retrieved ${data.length} ranked segments.`, type: 'success' });
    } catch (err) {
      setSearchStatus({ text: `Search Error: ${err.message}`, type: 'error' });
    }
  };

  // Filter local documents list using search bar input
  const filteredDocs = documents.filter(doc => {
    const word = searchWord.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(word) ||
      doc.doc_type?.toLowerCase().includes(word) ||
      doc.uat?.toLowerCase().includes(word)
    );
  });

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={`w-full font-inter bg-[#f0f0f0] min-h-screen ${selectedDoc ? 'py-3 px-2 md:px-4 space-y-4' : 'py-6 px-4 md:px-8 space-y-10'}`}>
      
      {/* Header matching reference design (About Terminal / Hero Header Style - Gridless & #f0f0f0 background) */}
      {!selectedDoc && (
        <div className="relative py-6 px-4 text-center space-y-6 overflow-hidden bg-transparent">
          {/* Subtle grid pattern background accent */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]"></div>

          {/* Hero Content matching reference image */}
          <div className="relative z-10 space-y-3 max-w-5xl mx-auto py-4">
            <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">
              TECHNICAL REPOSITORY
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#062a24] tracking-tight font-yd-gothic leading-[0.95]">
              Document Registry
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto pt-2">
              Centralized platform for SOPs, P&ID diagrams, OEM manuals, and compliance filings powered by automated OCR text extraction.
            </p>
          </div>

          {/* Action & Search Control Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-300/60 max-w-5xl mx-auto">
            {/* Left: Small Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Search title or type..."
                className="w-full bg-white border border-slate-200 focus:border-emerald-700/30 focus:ring-2 focus:ring-emerald-700/10 transition-all rounded-full py-2 pl-9 pr-3 text-xs font-semibold outline-none shadow-sm"
              />
            </div>

            {/* Center: Active count pill */}
            <span className="text-[11px] font-bold text-slate-600 bg-slate-200/70 px-4 py-1.5 rounded-full border border-slate-300/50">
              {filteredDocs.length} Active Records
            </span>

            {/* Right: Upload Button */}
            <div>
              {isAllowedToUpload && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-5 py-2 bg-[#062a24] hover:bg-[#08362e] text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={15} /> Upload Document
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AnimatePresence for smooth card flip transition between Grid and Full-Screen Details */}
      <AnimatePresence mode="wait">
        {selectedDoc ? (
          <motion.div
            key="details-expanded"
            initial={{ opacity: 0, scale: 0.96, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.96, rotateY: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full space-y-4 font-inter max-w-full overflow-x-hidden"
          >
            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between py-2 border-b border-slate-200/80">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#0a332c] transition-colors cursor-pointer bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
              >
                <ChevronLeft size={16} /> Back to Document Registry
              </button>
              <div className="text-xs font-semibold text-slate-500 hidden sm:block">
                Expanded View: <span className="font-bold text-slate-900">{selectedDoc.title}</span>
              </div>
            </div>

            {/* Main 2-Column Details Layout matching reference design */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full pt-2">
              
              {/* LEFT SIDE (Cols 1-7): Grid-Free / Card-Free clean rows matching reference image */}
              <div className="lg:col-span-7 space-y-8 px-2 md:px-4">
                
                {/* Section Heading */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">DOCUMENT OVERVIEW</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Technical Specification & Data
                  </h2>
                </div>

                {/* Info Rows without card/grid background - clean lines beneath pairs matching reference image */}
                <div className="space-y-6 pt-2">
                  {/* Pair 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-slate-300/70">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-400 block">Linked Asset UAT</span>
                      <span className="text-sm font-mono font-bold text-slate-900">{selectedDoc.uat || 'N/A'}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-400 block">Revision Version</span>
                      <span className="text-sm font-bold text-slate-900">v{selectedDoc.revision}</span>
                    </div>
                  </div>

                  {/* Pair 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-slate-300/70">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-400 block">Compliance Scopes</span>
                      <span className="text-sm font-bold text-slate-900">{selectedDoc.compliance_scope || 'ISO_9001'}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-400 block">Category Type</span>
                      <span className="text-sm font-bold text-slate-900">{selectedDoc.doc_type}</span>
                    </div>
                  </div>
                </div>

                {/* Process Status Notification */}
                {detailsStatus.text && (
                  <div className={`p-4 rounded-2xl text-xs font-semibold border ${
                    detailsStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                    detailsStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-emerald-50 border-emerald-100 text-emerald-800'
                  }`}>
                    {detailsStatus.text}
                  </div>
                )}

                {/* Named Entity Recognition (NER) Table in clean rows */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Database size={16} className="text-[#062a24]" />
                      Extracted Spans & Entities (NER)
                    </h3>
                    {isAllowedToUpload && (
                      <button 
                        onClick={() => handleProcessDoc(selectedDoc.doc_id)}
                        className="px-4 py-2 bg-[#062a24] hover:bg-[#08362e] text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Cpu size={14} /> Process Text
                      </button>
                    )}
                  </div>

                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/70">
                          <th className="p-3.5">Entity Type</th>
                          <th className="p-3.5">Value</th>
                          <th className="p-3.5">Offsets</th>
                          <th className="p-3.5">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {entitiesLoading ? (
                          <tr>
                            <td colSpan="4" className="p-5 text-center text-slate-400 italic">Reading spans from DB...</td>
                          </tr>
                        ) : entities.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="p-5 text-center text-slate-400 italic">
                              No spans extracted yet. Click "Process Text" to invoke regex and Groq models.
                            </td>
                          </tr>
                        ) : (
                          entities.map((ent, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3.5 font-bold text-[#062a24]">{ent.entity_type}</td>
                              <td className="p-3.5 font-mono font-bold text-slate-900">{ent.entity_value}</td>
                              <td className="p-3.5 text-slate-500 font-mono text-[11px]">{ent.start_char} - {ent.end_char}</td>
                              <td className="p-3.5 text-emerald-600 font-extrabold">{(ent.confidence * 100).toFixed(0)}%</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT SIDE (Cols 8-12): Green Shape Container matching reference design exactly */}
              <div className="lg:col-span-5 relative w-full">
                {/* Custom Green Shape Container with double notch clip-path */}
                <div 
                  className="bg-[#062a24] text-white rounded-[28px] p-7 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6 w-full"
                  style={{
                    clipPath: 'polygon(0 0, 72% 0, 78% 12px, 100% 12px, 100% 100%, 0 100%, 0 52%, 14px 52%, 14px 40%, 0 40%)'
                  }}
                >
                  <div className="space-y-6 pt-1">
                    {/* Header info inside green shape */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">SYSTEM RECORD</span>
                        <h3 className="text-2xl font-extrabold text-white leading-tight">
                          {selectedDoc.title}
                        </h3>
                      </div>

                      {/* Status pill inside dark green shape */}
                      <div className="bg-emerald-950/90 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider text-emerald-300 shadow-inner flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {getStatusBadge(selectedDoc.doc_type).label}
                      </div>
                    </div>

                    <div className="border-t border-emerald-900/80 pt-4 space-y-4">
                      <div className="text-[10px] font-bold text-emerald-400/90 uppercase tracking-widest">
                        DOCUMENT DETAILS SUMMARY:
                      </div>

                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-900/60">
                          <span className="text-emerald-200/80 font-medium">Linked Asset UAT:</span>
                          <span className="font-mono font-bold text-white text-xs">{selectedDoc.uat || 'N/A'}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-900/60">
                          <span className="text-emerald-200/80 font-medium">Revision State:</span>
                          <span className="font-bold text-white text-xs">v{selectedDoc.revision}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-900/60">
                          <span className="text-emerald-200/80 font-medium">Compliance Scope:</span>
                          <span className="font-bold text-white text-xs">{selectedDoc.compliance_scope || 'ISO_9001'}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs pb-2 border-b border-emerald-900/60">
                          <span className="text-emerald-200/80 font-medium">Category:</span>
                          <span className="font-bold text-white text-xs">{selectedDoc.doc_type}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inner Dark Action Box matching "Want to know more?" box from reference image */}
                    <div className="bg-[#0a352d]/90 border border-emerald-500/20 rounded-2xl p-5 space-y-3 mt-4">
                      <h4 className="text-sm font-extrabold text-white tracking-tight">
                        Document Operations
                      </h4>
                      <p className="text-xs text-emerald-200/70 leading-relaxed font-medium">
                        Run automated extraction algorithms or remove document entries from registry.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {isAllowedToUpload && (
                          <button 
                            onClick={() => handleProcessDoc(selectedDoc.doc_id)}
                            className="flex-1 py-2.5 bg-[#10b981] hover:bg-[#059669] text-[#062a24] rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer text-center"
                          >
                            Run AI Extraction
                          </button>
                        )}
                        {isAllowedToDelete && (
                          <button 
                            onClick={() => handleDeleteDoc(selectedDoc.doc_id)}
                            className="py-2.5 px-4 bg-[#3f1715]/90 hover:bg-[#5c1d1a] text-red-300 border border-red-500/30 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center"
                          >
                            Delete Entry
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid-catalog"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            {/* Grid of Cards matching reference image layout */}
            {loadingDocs ? (
              <div className="text-center py-20 text-xs font-bold text-slate-500">
                Loading document catalog...
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-20 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-[32px]">
                No technical documents found matching current filters.
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedDocs.map((doc, idx) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + idx;
                    const indexLabel = String(globalIndex + 1).padStart(2, '0');
                    const categoryImage = getDocCategoryImg(doc.doc_type);
                    const status = getStatusBadge(doc.doc_type);

                    return (
                      <motion.div 
                        key={doc.doc_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="bg-[#e6e8e6] rounded-[32px] border border-slate-300/40 p-6 md:p-7 flex flex-col justify-between space-y-6 hover:shadow-md transition-all duration-300"
                      >
                        <div className="space-y-4">
                          {/* Top category indices matching reference image */}
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-yd-gothic">
                            <span>{indexLabel}</span>
                            <span>•</span>
                            <span>{doc.doc_type}</span>
                            <span>•</span>
                            <span>UAT: {doc.uat || 'N/A'}</span>
                          </div>

                          {/* Header Title & Subtitle matching reference image */}
                          <div className="space-y-2">
                            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug tracking-tight font-yd-gothic">
                              {doc.title}
                            </h2>
                            <p className="text-xs leading-relaxed text-slate-600 font-medium font-yd-gothic">
                              Revision state: v{doc.revision} | Compliance scope: {doc.compliance_scope || 'ISO_9001'}
                            </p>
                          </div>

                          {/* Center Image Container with Dot Badge */}
                          <div className="h-48 md:h-52 w-full rounded-2xl overflow-hidden relative bg-slate-200/50 border border-slate-300/40 mt-3 shadow-xs">
                            <img 
                              src={categoryImage} 
                              alt={doc.title}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Status badge in top-right of image */}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider flex items-center gap-1.5 text-slate-800 shadow-sm font-yd-gothic">
                              <span className={`w-1.5 h-1.5 rounded-full ${status.colorClass.split(' ')[0]}`}></span>
                              {status.label}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Full-Width Action Button with bottom-to-top dark fill hover animation */}
                        <button
                          onClick={() => handleOpenDetails(doc)}
                          className="relative overflow-hidden w-full py-3 bg-[#d6d9d6] text-slate-700 rounded-xl text-[11px] font-extrabold tracking-widest transition-all duration-300 cursor-pointer shadow-xs group border border-slate-300/60 uppercase font-yd-gothic"
                        >
                          <span className="absolute inset-0 bg-[#062a24] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                          <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                            VIEW DETAILS
                          </span>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Page Segmentation / Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/60 mt-8">
                    <p className="text-xs font-semibold text-slate-500">
                      Showing <span className="font-extrabold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-extrabold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredDocs.length)}</span> of <span className="font-extrabold text-slate-900">{filteredDocs.length}</span> documents
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage(prev => Math.max(prev - 1, 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:hover:border-slate-200 disabled:cursor-not-allowed flex items-center gap-1 bg-white shadow-sm text-slate-700 cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                        Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              currentPage === page
                                ? 'bg-[#0a332c] text-white shadow-md'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage(prev => Math.min(prev + 1, totalPages));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:hover:border-slate-200 disabled:cursor-not-allowed flex items-center gap-1 bg-white shadow-sm text-slate-700 cursor-pointer"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <hr className="border-slate-200" />

      {/* RAG Vector Search in a Dark Green Scroll-Popup Folder Container */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#062a24] text-white rounded-[36px] md:rounded-[44px] p-6 md:p-10 border border-emerald-500/20 shadow-2xl relative overflow-hidden space-y-8 mt-12"
        style={{
          clipPath: 'polygon(0 0, 75% 0, 80% 16px, 100% 16px, 100% 100%, 0 100%)'
        }}
      >
        {/* Subtle grid pattern background accent */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>

        {/* Header content inside dark green folder */}
        <div className="relative z-10 space-y-2 text-center max-w-4xl mx-auto">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block font-yd-gothic">
            SEMANTIC INTELLIGENCE
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight font-yd-gothic leading-[0.95]">
            RAG Vector Cosine Search
          </h2>
          <p className="text-xs md:text-sm text-emerald-200/80 font-medium leading-relaxed max-w-xl mx-auto pt-1 font-yd-gothic">
            Perform cosine similarity search against active text chunks from the documentation.
          </p>
        </div>

        {/* Form elements styled inside the dark green folder container */}
        <form onSubmit={handleSearchSubmit} className="relative z-10 space-y-5 flex flex-col max-w-5xl mx-auto w-full">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-widest block font-yd-gothic">Semantic Search Query</label>
            <input 
              type="text" 
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. pressure trip limits or valve bypass operation..." 
              className="w-full bg-[#0a352d]/90 border border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all rounded-2xl p-3.5 text-xs font-semibold text-white placeholder:text-emerald-300/40 outline-none shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-widest block font-yd-gothic">Filter by Asset UAT</label>
              <input 
                type="text" 
                value={searchUat}
                onChange={(e) => setSearchUat(e.target.value)}
                placeholder="REF-HTX-E201-001" 
                className="w-full bg-[#0a352d]/90 border border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all rounded-2xl p-3 text-xs font-semibold text-white placeholder:text-emerald-300/40 outline-none shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-widest block font-yd-gothic">Threshold Similarity</label>
              <input 
                type="number" 
                step="0.05"
                min="0.0"
                max="1.0"
                value={searchThreshold}
                onChange={(e) => setSearchThreshold(parseFloat(e.target.value))}
                className="w-full bg-[#0a352d]/90 border border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all rounded-2xl p-3 text-xs font-semibold text-white outline-none shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-widest block font-yd-gothic">Max Limits</label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={searchLimit}
                onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                className="w-full bg-[#0a352d]/90 border border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all rounded-2xl p-3 text-xs font-semibold text-white outline-none shadow-inner"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="py-3 px-8 bg-[#10b981] hover:bg-[#059669] text-[#062a24] rounded-full text-xs font-extrabold transition-all shadow-lg self-start mt-2 cursor-pointer font-yd-gothic uppercase tracking-wider"
          >
            Search Embeddings
          </button>
        </form>

        {searchStatus.text && (
          <div className={`relative z-10 p-4 rounded-2xl text-xs font-semibold border ${
            searchStatus.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' :
            searchStatus.type === 'error' ? 'bg-red-950/80 border-red-500/40 text-red-200' :
            'bg-teal-950/80 border-teal-500/40 text-teal-200'
          }`}>
            {searchStatus.text}
          </div>
        )}

        {/* Semantic search results list */}
        {searchResults.length > 0 && (
          <div className="relative z-10 space-y-4 max-h-[450px] overflow-y-auto pt-2">
            {searchResults.map((res, index) => (
              <div key={res.embedding_id} className="bg-[#0a352d] border border-emerald-500/20 p-6 rounded-[24px] space-y-3 shadow-md">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-emerald-800/60 pb-2 text-[10px] text-emerald-300/70 font-bold uppercase tracking-wider">
                  <span>
                    Rank <strong className="text-white">#{index + 1}</strong> | Cosine Score: <strong className="text-emerald-400 text-xs">{(res.similarity * 100).toFixed(2)}%</strong>
                  </span>
                  <span>
                    Asset UAT: <strong className="text-white">{res.chunk_metadata.uat || 'N/A'}</strong> | Type: <strong className="text-white">{res.chunk_metadata.doc_type || 'N/A'}</strong>
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Source: {res.chunk_metadata.title || 'N/A'}</div>
                <blockquote className="border-l-3 border-emerald-400 pl-3 text-xs leading-relaxed italic text-emerald-100/90 whitespace-pre-wrap">
                  {res.chunk_text}
                </blockquote>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
