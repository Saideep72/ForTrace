import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileDown, RefreshCw, Layers, ShieldCheck, HelpCircle } from 'lucide-react';
import { apiFetch, getUserRole } from '../utils';

export default function ReportsAudit() {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const isAuthorized = ['Plant_Manager', 'Admin', 'Auditor', 'Safety_Officer'].includes(userRole);

  // States
  const [failId, setFailId] = useState('1');
  const [reportStatus, setReportStatus] = useState({ text: '', type: '' });
  
  const [subTab, setSubTab] = useState('ecr'); // 'ecr' or 'audit'
  const [ecrData, setEcrData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Initial load
  useEffect(() => {
    if (isAuthorized) {
      if (subTab === 'ecr') fetchECR();
      else fetchAuditLogs();
    }
  }, [subTab]);

  const fetchECR = async () => {
    setLoadingAudit(true);
    try {
      const data = await apiFetch('reports/engineering-changes?limit=50');
      setEcrData(data || []);
    } catch (err) {
      console.error("Failed to fetch ECR ledger:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const data = await apiFetch('reports/audit-logs?limit=50');
      setAuditData(data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleDownloadRCA = async (e) => {
    e.preventDefault();
    setReportStatus({ text: 'Compiling and generating PDF audit package...', type: 'info' });

    try {
      // apiFetch returns a Blob when the content-type is application/pdf
      const blob = await apiFetch('reports/rca', {
        method: 'POST',
        body: { failure_id: parseInt(failId) }
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `RCA_Report_${failId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setReportStatus({ text: 'RCA PDF Compiled and Downloaded successfully!', type: 'success' });
    } catch (err) {
      setReportStatus({ text: `Failed to download report: ${err.message}`, type: 'error' });
    }
  };

  const [certStatus, setCertStatus] = useState({ text: '', type: '', score: '', grade: '', sig: '' });
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  const handleDownloadComplianceCertificate = async () => {
    setIsGeneratingCert(true);
    setCertStatus({ text: '📜 Generating cryptographically signed compliance certificate...', type: 'info' });

    try {
      const blob = await apiFetch('reports/compliance-certificate', {
        method: 'POST'
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ForTrace_Compliance_Certificate_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setCertStatus({
        text: '✅ Compliance Certificate generated & downloaded!',
        type: 'success'
      });
    } catch (err) {
      setCertStatus({ text: `❌ Failed to generate certificate: ${err.message}`, type: 'error' });
    } finally {
      setIsGeneratingCert(false);
    }
  };

  const handleEntityClick = (uat) => {
    if (uat) {
      sessionStorage.setItem('ft-preselected-node', uat);
      navigate('/network');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center text-textMuted font-inter">
        <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
        <p className="mt-2 text-xs font-semibold">You do not have permission to view Reports & Compliance Audits.</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-2 md:px-6 w-full max-w-full space-y-8 font-yd-gothic">
      {/* Hero Header matching Document Registry design */}
      <div className="relative py-6 px-2 text-center space-y-2.5 overflow-hidden bg-transparent">
        {/* Subtle grid pattern background accent */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]"></div>

        <div className="relative z-10 space-y-3 max-w-full mx-auto py-4">
          <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">
            COMPLIANCE & CAUSAL AUDIT
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#062a24] tracking-tight font-yd-gothic leading-[0.95]">
            Reports & Immutable Audit Trail
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto pt-2 font-yd-gothic">
            Generate root cause compliance packages and inspect secure engineering change logs verified via cryptographic proof.
          </p>
        </div>
      </div>

      {/* Status Notification Banner */}
      {reportStatus.text && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold border transition-all ${
          reportStatus.type === 'success' ? 'bg-[#0d3c34] border-[#062a24] text-emerald-200 shadow-sm' :
          reportStatus.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-200 shadow-sm' :
          'bg-teal-950/90 border-teal-500/40 text-teal-200 shadow-sm'
        }`}>
          {reportStatus.text}
        </div>
      )}

      {/* Compliance Audit Readiness Certificate Banner */}
      <div className="bg-[#062a24] text-white rounded-2xl p-5 border border-[#0a332c] shadow-md space-y-3 font-yd-gothic">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <span>📜</span> Compliance Audit Readiness Certificate
            </h3>
            <p className="text-xs text-emerald-100/70 font-medium leading-relaxed">
              Generates a cryptographically signed multi-page PDF with full asset compliance status, Merkle chain verification, and digital signature hashes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadComplianceCertificate}
            disabled={isGeneratingCert}
            className="py-2.5 px-5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap uppercase tracking-wider disabled:opacity-50"
          >
            <span>📜</span>
            <span>{isGeneratingCert ? 'Generating Certificate...' : 'Generate Compliance Certificate'}</span>
          </button>
        </div>

        {certStatus.text && (
          <div className={`p-2.5 rounded-xl text-xs font-semibold ${
            certStatus.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
            certStatus.type === 'error' ? 'bg-red-950/80 text-red-300 border border-red-800' :
            'bg-blue-950/80 text-blue-300 border border-blue-800'
          }`}>
            {certStatus.text}
          </div>
        )}
      </div>

      {/* Full-width Section with Header Tab Bar & Rightmost RCA PDF Download */}
      <div className="w-full bg-transparent space-y-5 font-yd-gothic px-2">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300/60 pb-3 select-none">
          {/* Sub-Tabs: ECR & Query Audit Logs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSubTab('ecr')}
              className={`py-2.5 px-5 text-xs font-extrabold rounded-full transition-all cursor-pointer font-yd-gothic ${
                subTab === 'ecr' 
                  ? 'bg-[#062a24] text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              Engineering Change Records (ECR)
            </button>
            <button 
              onClick={() => setSubTab('audit')}
              className={`py-2.5 px-5 text-xs font-extrabold rounded-full transition-all cursor-pointer font-yd-gothic ${
                subTab === 'audit' 
                  ? 'bg-[#062a24] text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              Query Audit Logs
            </button>
          </div>

          {/* Rightmost: Download RCA PDF Report Button & Input */}
          <form onSubmit={handleDownloadRCA} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap font-yd-gothic">Failure ID:</span>
              <input 
                type="number"
                min="1"
                required
                value={failId}
                onChange={(e) => setFailId(e.target.value)}
                placeholder="1"
                className="w-14 bg-transparent text-xs font-bold text-slate-800 outline-none text-center"
              />
            </div>
            <button 
              type="submit" 
              className="py-2.5 px-5 bg-[#062a24] hover:bg-[#08362e] text-white rounded-full text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-wider font-yd-gothic whitespace-nowrap"
            >
              <FileDown size={14} />
              <span>Download PDF Report</span>
            </button>
          </form>
        </div>

          {/* Sub-Tab content */}
          {subTab === 'ecr' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-[#062a24] flex items-center gap-2 uppercase tracking-wide">
                  <Layers size={16} className="text-[#062a24]" />
                  Merkle-Verified ECR Ledger
                </h3>
                <button 
                  onClick={fetchECR}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Refresh Ledger"
                >
                  <RefreshCw size={12} className={loadingAudit ? "animate-spin text-slate-700" : "text-slate-700"} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300/80 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-3 px-3 font-bold">Commit Hash</th>
                      <th className="py-3 px-3 font-bold">UAT / Entity</th>
                      <th className="py-3 px-3 font-bold">Action</th>
                      <th className="py-3 px-3 font-bold">Change Engineer</th>
                      <th className="py-3 px-3 font-bold">Approved By</th>
                      <th className="py-3 px-3 font-bold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAudit ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400 font-medium">Loading Merkle ledger logs...</td>
                      </tr>
                    ) : ecrData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400">No engineering change records in database.</td>
                      </tr>
                    ) : (
                      ecrData.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200/60 hover:bg-slate-200/40 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-600" title={item.commit_hash}>
                            {item.commit_hash ? item.commit_hash.slice(0, 8) + '...' : 'N/A'}
                          </td>
                          <td className="p-3">
                            <button 
                              type="button" 
                              onClick={() => handleEntityClick(item.uat)}
                              className="text-[#062a24] hover:underline font-extrabold text-left cursor-pointer"
                            >
                              {item.entity_id || item.uat}
                            </button>
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                              {item.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 font-semibold">{item.engineer_name || 'System'}</td>
                          <td className="p-3 text-slate-700 font-semibold">{item.approved_by || 'Auto'}</td>
                          <td className="p-3 text-slate-400 text-[10.5px] font-medium">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-[#062a24] flex items-center gap-2 uppercase tracking-wide">
                  <ShieldCheck size={16} className="text-[#062a24]" />
                  Agent Request Compliance Audit
                </h3>
                <button 
                  onClick={fetchAuditLogs}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Refresh Audit Logs"
                >
                  <RefreshCw size={12} className={loadingAudit ? "animate-spin text-slate-700" : "text-slate-700"} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300/80 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-3 px-3 font-bold">Role</th>
                      <th className="py-3 px-3 font-bold">Query</th>
                      <th className="py-3 px-3 font-bold">Agent Node</th>
                      <th className="py-3 px-3 font-bold">Conf.</th>
                      <th className="py-3 px-3 font-bold">Latency</th>
                      <th className="py-3 px-3 font-bold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAudit ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400 font-medium">Loading compliance logs...</td>
                      </tr>
                    ) : auditData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400">No compliance query logs in database.</td>
                      </tr>
                    ) : (
                      auditData.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200/60 hover:bg-slate-200/40 transition-colors text-slate-700">
                          <td className="p-3 font-extrabold text-slate-900">{item.user_role}</td>
                          <td className="p-3 italic">"{item.query_text}"</td>
                          <td className="p-3 font-bold text-emerald-800">{item.agent_used || 'Supervisor'}</td>
                          <td className="p-3 font-bold text-emerald-600">{((item.intent_confidence || 1.0) * 100).toFixed(0)}%</td>
                          <td className="p-3 font-mono">{item.latency_ms} ms</td>
                          <td className="p-3 text-slate-400 text-[10.5px] font-medium">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
