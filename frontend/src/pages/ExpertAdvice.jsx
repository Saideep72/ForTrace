import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, ShieldCheck, RefreshCw, FileText, Plus, X, 
  BookOpen, Sparkles, CheckCircle2, AlertTriangle, Key, Mail, User
} from 'lucide-react';
import { apiFetch, getUserRole } from '../utils';

export default function ExpertAdvice() {
  const userRole = getUserRole();
  const isManagerOrAdmin = ['Plant_Manager', 'Admin'].includes(userRole);
  
  // Active Tab: 'portal' or 'registry'
  const [activeTab, setActiveTab] = useState(isManagerOrAdmin ? 'registry' : 'portal');

  // Portal States
  const [failureCases, setFailureCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Tacit Wisdom Form States
  const [wisdomTitle, setWisdomTitle] = useState('');
  const [wisdomInsight, setWisdomInsight] = useState('');
  const [wisdomVerdict, setWisdomVerdict] = useState('');
  const [submittingWisdom, setSubmittingWisdom] = useState(false);
  const [wisdomStatus, setWisdomStatus] = useState({ text: '', type: '' });

  // Registry States
  const [expertsList, setExpertsList] = useState([]);
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState(null);

  // Provision Expert Modal States
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provisioningStatus, setProvisioningStatus] = useState({ text: '', type: '' });
  const [isProvisioning, setIsProvisioning] = useState(false);

  // State for expanding/collapsing long review descriptions
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleExpandReview = (docId) => {
    setExpandedReviews(prev => ({ ...prev, [docId]: !prev[docId] }));
  };

  // Load failure cases for Portal
  const loadFailureCases = async () => {
    setLoadingCases(true);
    try {
      const data = await apiFetch('expert/failure-cases');
      setFailureCases(data.cases || []);
    } catch (err) {
      console.error('Failed to load failure cases:', err);
    } finally {
      setLoadingCases(false);
    }
  };

  // Load selected failure case detail
  const loadCaseDetail = async (id) => {
    setSelectedCaseId(id);
    setLoadingDetail(true);
    setCaseDetail(null);
    setWisdomStatus({ text: '', type: '' });
    try {
      const data = await apiFetch(`expert/failure-cases/${id}`);
      setCaseDetail(data);
      setWisdomTitle(`Wisdom Note — ${data.failure?.failure_mode || 'Incident'}`);
    } catch (err) {
      console.error('Failed to load case detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Tacit Wisdom Note
  const handleSubmitWisdom = async (e) => {
    e.preventDefault();
    if (!caseDetail || !wisdomTitle.trim() || !wisdomInsight.trim()) return;

    setSubmittingWisdom(true);
    setWisdomStatus({ text: 'Ingesting and embedding tacit wisdom note into vector store...', type: 'info' });

    try {
      const data = await apiFetch('expert/wisdom', {
        method: 'POST',
        body: {
          title: wisdomTitle.trim(),
          uat: caseDetail.failure?.uat,
          insight_text: wisdomInsight.trim(),
          verdict: wisdomVerdict.trim(),
          failure_id: caseDetail.failure?.failure_id
        }
      });

      setWisdomStatus({ text: `✅ ${data.message || 'Wisdom note embedded successfully!'}`, type: 'success' });
      setWisdomInsight('');
      setWisdomVerdict('');

      // Refresh case detail to show new note in existing notes
      loadCaseDetail(selectedCaseId);
    } catch (err) {
      setWisdomStatus({ text: `❌ Submission failed: ${err.message}`, type: 'error' });
    } finally {
      setSubmittingWisdom(false);
    }
  };

  // Load Registry of Experts
  const loadExpertRegistry = async () => {
    setLoadingRegistry(true);
    try {
      const data = await apiFetch('expert/registry');
      const experts = data.experts || [];
      setExpertsList(experts);
      if (experts.length > 0 && !selectedExpertId) {
        setSelectedExpertId(experts[0].expert_id);
      }
    } catch (err) {
      console.error('Failed to load expert registry:', err);
    } finally {
      setLoadingRegistry(false);
    }
  };

  // Generate random strong password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setProvPassword(pass);
  };

  // Provision Expert submit
  const handleProvisionExpert = async (e) => {
    e.preventDefault();
    if (!provName.trim() || !provEmail.trim() || !provPassword.trim()) return;

    setIsProvisioning(true);
    setProvisioningStatus({ text: 'Creating Expert account in Supabase Auth...', type: 'info' });

    try {
      await apiFetch('expert/create', {
        method: 'POST',
        body: {
          full_name: provName.trim(),
          email: provEmail.trim(),
          password: provPassword.trim()
        }
      });

      setProvisioningStatus({ text: '✅ Expert account created successfully!', type: 'success' });
      setTimeout(() => {
        setIsProvisionModalOpen(false);
        setProvName('');
        setProvEmail('');
        setProvPassword('');
        setProvisioningStatus({ text: '', type: '' });
        loadExpertRegistry();
      }, 1500);
    } catch (err) {
      setProvisioningStatus({ text: `❌ Provisioning failed: ${err.message}`, type: 'error' });
    } finally {
      setIsProvisioning(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'portal') {
      loadFailureCases();
    } else if (activeTab === 'registry') {
      loadExpertRegistry();
    }
  }, [activeTab]);

  const selectedExpert = expertsList.find(e => e.expert_id === selectedExpertId);

  return (
    <div className="py-6 px-4 md:px-8 w-full max-w-full space-y-8 font-yd-gothic">
      {/* Gridless Seamless Header */}
      <div className="relative py-4 px-2 text-center space-y-4 overflow-hidden bg-transparent">
        <div className="relative z-10 space-y-2 max-w-4xl mx-auto">
          <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">
            TACIT KNOWLEDGE ENGINE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#062a24] tracking-tight font-yd-gothic leading-tight">
            Expert Advice & Tacit Wisdom Registry
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto pt-1 font-yd-gothic">
            Ingest, review, and leverage tribal operational wisdom from senior & retiring plant engineers.
          </p>
        </div>

        {/* Tab Controls & Provision Action Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-300/60 w-full">
          <div className="bg-slate-200/60 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('portal')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'portal'
                  ? 'bg-[#062a24] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expert Engineer Portal
            </button>
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab('registry')}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'registry'
                    ? 'bg-[#062a24] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Retired Experts Registry
              </button>
            )}
          </div>

          {isManagerOrAdmin && (
            <button
              onClick={() => {
                setIsProvisionModalOpen(true);
                generatePassword();
              }}
              className="py-2.5 px-5 bg-gradient-to-r from-[#062a24] to-emerald-800 hover:from-[#0d3c34] hover:to-emerald-700 text-white rounded-full text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck size={14} />
              <span>Provision Expert</span>
            </button>
          )}
        </div>
      </div>

      {/* PORTAL TAB VIEW */}
      {activeTab === 'portal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Failure Incidents Sidebar (Gridless Seamless) */}
          <div className="bg-transparent space-y-3 h-fit pr-1">
            <div className="flex justify-between items-center border-b border-slate-300/60 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋</span> Failure Incidents ({failureCases.length})
              </h3>
              <button
                onClick={loadFailureCases}
                className="p-1.5 bg-white/80 hover:bg-white border border-slate-200/60 rounded-xl text-slate-600 shadow-2xs"
                title="Refresh Cases"
              >
                <RefreshCw size={12} className={loadingCases ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {loadingCases ? (
                <div className="text-xs font-medium text-slate-400 text-center py-8">Loading incidents...</div>
              ) : failureCases.length === 0 ? (
                <div className="text-xs font-medium text-slate-400 text-center py-8">No failure cases found.</div>
              ) : (
                failureCases.map((fc) => {
                  const isSelected = selectedCaseId === fc.failure_id;
                  return (
                    <button
                      key={fc.failure_id}
                      onClick={() => loadCaseDetail(fc.failure_id)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'bg-emerald-100/90 border border-emerald-300/80 shadow-xs'
                          : 'bg-white/70 hover:bg-white border border-slate-200/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-900">{fc.asset_tag}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          fc.severity === 'high' || fc.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fc.severity}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 line-clamp-1">{fc.failure_mode}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-1">
                        <span>{fc.occurrence_date ? fc.occurrence_date.slice(0, 10) : 'N/A'}</span>
                        <span className="text-emerald-700 font-bold">{fc.expert_notes_count} Notes</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected Case Details & Wisdom Submission Form */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedCaseId ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
                  📋
                </div>
                <h3 className="text-base font-bold text-slate-800">Select a Failure Incident</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Choose an incident from the left sidebar to view operational telemetry and record tacit wisdom notes.
                </p>
              </div>
            ) : loadingDetail ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs font-bold text-slate-500">
                Loading incident details...
              </div>
            ) : caseDetail && (
              <div className="space-y-6">
                {/* Incident Detail Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">INCIDENT DETAILS</span>
                      <h2 className="text-xl font-black text-slate-900">
                        {caseDetail.asset?.equipment_tag} — {caseDetail.failure?.failure_mode}
                      </h2>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                      UAT: {caseDetail.failure?.uat}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium text-slate-600">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Category</span>
                      <span className="font-extrabold text-slate-800">{caseDetail.failure?.failure_category}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Downtime</span>
                      <span className="font-extrabold text-slate-800">{caseDetail.failure?.downtime_hours || 0} Hours</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Alarms Linked</span>
                      <span className="font-extrabold text-slate-800">{caseDetail.alarms?.length || 0} Alarms</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Existing Wisdom</span>
                      <span className="font-extrabold text-emerald-800">{caseDetail.expert_notes?.length || 0} Notes</span>
                    </div>
                  </div>

                  {/* Existing Wisdom Notes */}
                  {caseDetail.expert_notes && caseDetail.expert_notes.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Submitted Tacit Notes</h4>
                      <div className="space-y-2">
                        {caseDetail.expert_notes.map((n) => (
                          <div key={n.doc_id} className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                            <div className="font-bold text-amber-950">{n.title}</div>
                            <div className="text-[10px] text-amber-700">Updated: {new Date(n.updated_at).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tacit Wisdom Form */}
                <form onSubmit={handleSubmitWisdom} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>✍️</span> Capture Tacit Wisdom
                    </h3>
                    <p className="text-xs text-slate-500 font-medium pt-0.5">
                      Your operational insights will be embedded into the RAG vector store and retrievable via Expert Shield queries.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Note Title *</label>
                      <input
                        type="text"
                        required
                        value={wisdomTitle}
                        onChange={(e) => setWisdomTitle(e.target.value)}
                        placeholder="e.g. Pump Seal Degradation Pattern"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Asset UAT</label>
                      <input
                        type="text"
                        readOnly
                        value={caseDetail.failure?.uat || ''}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Detailed Insight / Tacit Knowledge *</label>
                    <textarea
                      rows={4}
                      required
                      value={wisdomInsight}
                      onChange={(e) => setWisdomInsight(e.target.value)}
                      placeholder="Describe what you've learned working with this equipment. Include heuristics, warning signs, unwritten procedures..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Verdict / Key Recommendation</label>
                    <input
                      type="text"
                      value={wisdomVerdict}
                      onChange={(e) => setWisdomVerdict(e.target.value)}
                      placeholder="e.g. Inspect bearing housing seal every 6 months during turnaround"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingWisdom}
                    className="w-full py-3 bg-[#062a24] hover:bg-[#08362e] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingWisdom ? 'Ingesting & Embedding Wisdom...' : 'Submit & Embed into Knowledge Base'}
                  </button>

                  {wisdomStatus.text && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${
                      wisdomStatus.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                      wisdomStatus.type === 'error' ? 'bg-red-50 text-red-900 border border-red-200' :
                      'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}>
                      {wisdomStatus.text}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REGISTRY TAB VIEW (Gridless Seamless) */}
      {activeTab === 'registry' && isManagerOrAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Experts List Sidebar */}
          <div className="bg-transparent space-y-3 h-fit pr-1">
            <div className="flex justify-between items-center border-b border-slate-300/60 pb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>👨‍🔧</span> Active Experts ({expertsList.length})
              </h3>
              <button
                onClick={loadExpertRegistry}
                className="p-1.5 bg-white/80 hover:bg-white border border-slate-200/60 rounded-xl text-slate-600 shadow-2xs"
                title="Refresh Registry"
              >
                <RefreshCw size={12} className={loadingRegistry ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="space-y-2">
              {loadingRegistry ? (
                <div className="text-xs font-medium text-slate-400 text-center py-8">Loading registry...</div>
              ) : expertsList.length === 0 ? (
                <div className="text-xs font-medium text-slate-400 text-center py-8">No experts found.</div>
              ) : (
                expertsList.map((exp) => {
                  const isSelected = selectedExpertId === exp.expert_id;
                  return (
                    <button
                      key={exp.expert_id}
                      onClick={() => setSelectedExpertId(exp.expert_id)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? 'bg-emerald-100/90 border border-emerald-300/80 shadow-xs'
                          : 'bg-white/70 hover:bg-white border border-slate-200/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-900">{exp.full_name}</span>
                        <span className="px-2.5 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-full text-[9px] font-extrabold">
                          {exp.reviews_count} Notes
                        </span>
                      </div>
                      <p className="text-[10.5px] font-medium text-slate-500">{exp.email}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Expert Dossier Reviews */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedExpert ? (
              <div className="text-center py-12 text-xs font-bold text-slate-400">
                Select an expert from the left sidebar to inspect their submitted dossiers.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EXPERT DOSSIER</span>
                    <h2 className="text-lg font-black text-slate-900">{selectedExpert.full_name}</h2>
                    <p className="text-xs text-slate-500">{selectedExpert.email} · Role: {selectedExpert.role}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                    {selectedExpert.reviews_count} Wisdom Notes Submitted
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedExpert.reviews && selectedExpert.reviews.length > 0 ? (
                    selectedExpert.reviews.map((rev) => {
                      const isExpanded = !!expandedReviews[rev.doc_id];
                      const textLimit = 220;
                      const isLong = rev.insight && rev.insight.length > textLimit;
                      const displayText = isExpanded || !isLong ? rev.insight : rev.insight.slice(0, textLimit) + '...';

                      return (
                        <div key={rev.doc_id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-slate-900">{rev.title}</h4>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(rev.updated_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-200/60 space-y-2">
                            <p className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {displayText}
                            </p>
                            {isLong && (
                              <button
                                type="button"
                                onClick={() => toggleExpandReview(rev.doc_id)}
                                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer flex items-center gap-1 pt-1"
                              >
                                <span>{isExpanded ? 'Show Less' : 'More...'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-8">No wisdom notes submitted by this expert yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROVISION EXPERT MODAL */}
      <AnimatePresence>
        {isProvisionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 font-yd-gothic"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>👤</span> Provision Expert Account
                </h3>
                <button
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleProvisionExpert} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={provName}
                    onChange={(e) => setProvName(e.target.value)}
                    placeholder="Dr. Senior Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={provEmail}
                    onChange={(e) => setProvEmail(e.target.value)}
                    placeholder="expert@plant.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Initial Password *</label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-[10px] text-emerald-700 font-extrabold hover:underline"
                    >
                      Generate Random
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={provPassword}
                    onChange={(e) => setProvPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800 outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProvisionModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="flex-2 py-2.5 bg-[#062a24] hover:bg-[#08362e] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isProvisioning ? 'Creating Account...' : 'Create Expert Account'}
                  </button>
                </div>

                {provisioningStatus.text && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    provisioningStatus.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                    provisioningStatus.type === 'error' ? 'bg-red-50 text-red-900 border border-red-200' :
                    'bg-blue-50 text-blue-900 border border-blue-200'
                  }`}>
                    {provisioningStatus.text}
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
