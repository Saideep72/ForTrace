import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, FileText, Share2, AlertTriangle, Cpu, Factory, ArrowRight, Network, ShieldCheck, Bot, FileCheck2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils';
import HeroSection from '../components/HeroSection';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assets: 23,
    docs: 0,
    links: 26,
    alarms: 5,
    loading: true
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await apiFetch('documents?limit=200');
        const docCount = response.items ? response.items.length : 0;

        const incidentReports = response.items
          ? response.items.filter(d => d.doc_type === 'INCIDENT_REPORT').length
          : 0;
        const alarmCount = incidentReports * 2 + 3;

        setStats(prev => ({
          ...prev,
          docs: docCount,
          alarms: alarmCount,
          loading: false
        }));
      } catch (err) {
        console.warn("Failed to load home page statistics:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    loadStats();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };



  return (
    <div className="w-full space-y-10 font-yd-gothic pb-16">
      {/* Full-width Industrial Intelligence Hero Section */}
      <div className="w-full px-6 md:px-12 lg:px-16 pt-0">
        <div className="max-w-[1440px] mx-auto">
          <HeroSection onStartAnalysis={() => navigate('/ai')} />
        </div>
      </div>

      <div className="px-6 md:px-8 max-w-7xl mx-auto space-y-10">

        {/* Platform Enclave Sections Header (Centered, Huge Text, #0a332c) */}
        <div className="border-b border-slate-200/80 pb-6 text-center space-y-4 pt-4">
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#0a332c] tracking-tight uppercase font-yd-gothic leading-[1.05]">
            PLATFORM ENCLAVE SECTIONS
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#0a332c]/80 font-yd-gothic max-w-5xl mx-auto leading-relaxed">
            Core operational modules governing industrial intelligence, vector search, and causal graph analytics.
          </p>
        </div>

        {/* Four Platform Feature Images with Data Flow Callouts (Entry, Processing, Output) */}
        <div className="space-y-16 pt-2">
          {[
            {
              image: '/1.png',
              sectionTitle: 'DOCUMENT REGISTRY & VECTOR PROCESSING PIPELINE',
              callouts: [
                { id: 'c1-1', badge: '1. DATA INGESTION ENTRY', title: 'Data Entry Stream', text: 'Technical PDFs, P&ID schematics & maintenance logs enter pipeline', dot: { left: '16%', top: '34%' }, labelPos: 'top-4 left-2 sm:left-6', line: { x1: 16, y1: 34, x2: 12, y2: 16 } },
                { id: 'c1-2', badge: '2. VECTOR PROCESSING', title: 'Embedding Engine', text: 'High-dimensional pgvector chunking & semantic index processing', dot: { left: '46%', top: '48%' }, labelPos: 'top-2 left-[36%] sm:left-[42%]', line: { x1: 46, y1: 48, x2: 46, y2: 18 } },
                { id: 'c1-3', badge: '3. ENTITY EXTRACTION', title: 'NER Parsing Node', text: 'Identifies equipment UATs, failure modes & operational tags', dot: { left: '76%', top: '28%' }, labelPos: 'top-4 right-2 sm:right-6', line: { x1: 76, y1: 28, x2: 80, y2: 16 } },
                { id: 'c1-4', badge: '4. KNOWLEDGE OUTPUT', title: 'Vector Retrieval', text: 'Delivers RAG context to multi-agent diagnostic enclaves', dot: { left: '80%', top: '70%' }, labelPos: 'bottom-4 right-2 sm:right-6', line: { x1: 80, y1: 70, x2: 82, y2: 82 } }
              ]
            },
            {
              image: '/2.png',
              sectionTitle: 'AI AGENT DESK & HARDWARE ENCLAVE PIPELINE',
              callouts: [
                { id: 'c2-1', badge: '1. DATA INPUT STREAM', title: 'Query & Sensor Inputs', text: 'Operator prompts & real-time telemetry parameters enter desk', dot: { left: '18%', top: '32%' }, labelPos: 'top-4 left-2 sm:left-6', line: { x1: 18, y1: 32, x2: 14, y2: 16 } },
                { id: 'c2-2', badge: '2. ENCLAVE PROCESSING', title: 'AMD SEV-SNP Enclave', text: 'Zero-trust hardware-isolated execution & attestation proof', dot: { left: '48%', top: '22%' }, labelPos: 'top-2 left-[36%] sm:left-[40%]', line: { x1: 48, y1: 22, x2: 48, y2: 14 } },
                { id: 'c2-3', badge: '3. AGENT REASONING', title: 'Multi-Agent Network', text: 'Supervisor & cause analysis agents collaborate on diagnostics', dot: { left: '74%', top: '36%' }, labelPos: 'top-6 right-2 sm:right-6', line: { x1: 74, y1: 36, x2: 78, y2: 18 } },
                { id: 'c2-4', badge: '4. DIAGNOSTIC OUTPUT', title: 'Root Cause Summary', text: 'Causal analytics report & recommended corrective actions', dot: { left: '78%', top: '68%' }, labelPos: 'bottom-4 right-2 sm:right-6', line: { x1: 78, y1: 68, x2: 80, y2: 82 } }
              ]
            },
            {
              image: '/3.png',
              sectionTitle: 'CAUSAL TOPOLOGY & GRAPH ANALYTICS PIPELINE',
              callouts: [
                { id: 'c3-1', badge: '1. TOPOLOGY FEED', title: 'Asset Telemetry Input', text: 'Physical equipment nodes, work orders & alarm signals enter', dot: { left: '20%', top: '28%' }, labelPos: 'top-4 left-2 sm:left-6', line: { x1: 20, y1: 28, x2: 16, y2: 16 } },
                { id: 'c3-2', badge: '2. GRAPH PROCESSING', title: 'Vis-Network Engine', text: 'Dynamic graph modeling & interactive failure pathway traversal', dot: { left: '48%', top: '48%' }, labelPos: 'bottom-4 left-[34%] sm:left-[38%]', line: { x1: 48, y1: 48, x2: 48, y2: 82 } },
                { id: 'c3-3', badge: '3. CASCADE ANALYTICS', title: 'Alarm Propagation', text: 'Automatic failure path isolation & upstream root cause trace', dot: { left: '74%', top: '28%' }, labelPos: 'top-4 right-2 sm:right-6', line: { x1: 74, y1: 28, x2: 78, y2: 16 } },
                { id: 'c3-4', badge: '4. SUBNETWORK FOCUS', title: 'Isolated Topology', text: 'Hover subnetwork focus & node popovers for field engineers', dot: { left: '72%', top: '68%' }, labelPos: 'bottom-4 right-2 sm:right-6', line: { x1: 72, y1: 68, x2: 76, y2: 82 } }
              ]
            },
            {
              image: '/4.png',
              sectionTitle: 'CRYPTOGRAPHIC AUDIT & MERKLE LEDGER PIPELINE',
              callouts: [
                { id: 'c4-1', badge: '1. CHANGE INGESTION', title: 'ECR Request Input', text: 'Engineering change records & parameter updates logged', dot: { left: '16%', top: '30%' }, labelPos: 'top-4 left-2 sm:left-6', line: { x1: 16, y1: 30, x2: 14, y2: 16 } },
                { id: 'c4-2', badge: '2. MERKLE HASHING', title: 'Block Verification', text: 'Cryptographic Merkle tree computation & immutable hashing', dot: { left: '50%', top: '44%' }, labelPos: 'top-2 left-[36%] sm:left-[40%]', line: { x1: 50, y1: 44, x2: 50, y2: 16 } },
                { id: 'c4-3', badge: '3. AUDIT TRAIL LOGS', title: 'Immutable Ledger', text: 'Tamper-proof role access logs & verified change history', dot: { left: '76%', top: '30%' }, labelPos: 'top-4 right-2 sm:right-6', line: { x1: 76, y1: 30, x2: 80, y2: 16 } },
                { id: 'c4-4', badge: '4. COMPLIANCE OUTPUT', title: 'RCA PDF Package', text: 'Cryptographically signed PDF report output for compliance', dot: { left: '78%', top: '70%' }, labelPos: 'bottom-4 right-2 sm:right-6', line: { x1: 78, y1: 70, x2: 80, y2: 82 } }
              ]
            }
          ].map((sec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              className="w-full bg-transparent py-6 space-y-6"
            >
              {/* Section Header (Gridless & Huge Text) */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-center space-y-1 pt-4"
              >
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0a332c] tracking-tight uppercase font-yd-gothic leading-none">
                  SECTION 0{idx + 1}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#0a332c]/75 uppercase tracking-widest font-yd-gothic mt-2">
                  {sec.sectionTitle}
                </h3>
              </motion.div>

              {/* Image Container with Annotated Pipeline Callouts (Gridless & Transparent) */}
              <div className="relative w-full min-h-[380px] sm:min-h-[480px] flex items-center justify-center overflow-hidden py-2 bg-transparent">
                {/* SVG Overlay for Bold Connecting Leader Lines */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {sec.callouts.map((c, cIdx) => (
                    <motion.path
                      key={`line-${c.id}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.35 + cIdx * 0.18 }}
                      d={`M ${c.line.x1} ${c.line.y1} L ${c.line.x1} ${(c.line.y1 + c.line.y2) / 2} L ${c.line.x2} ${c.line.y2}`}
                      stroke="#0a332c"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>

                {/* 1st: Image appears first on scroll */}
                <motion.img
                  initial={{ opacity: 0, scale: 0.94, y: 25 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
                  src={sec.image}
                  alt={sec.sectionTitle}
                  className="w-full max-w-5xl h-auto object-contain mx-auto filter drop-shadow-md select-none"
                />

                {/* 2nd: Staggered reveal of Callout Text Boxes one after another */}
                {sec.callouts.map((c, cIdx) => (
                  <React.Fragment key={c.id}>
                    {/* Pulsing Target Dot on Image */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.35 + cIdx * 0.18 }}
                      style={{ left: c.dot.left, top: c.dot.top }}
                      className="absolute w-4 h-4 -ml-2 -mt-2 bg-emerald-500 rounded-full border-2 border-white ring-4 ring-emerald-500/30 shadow-md animate-pulse z-20"
                      title={c.title}
                    />

                    {/* Floating Callout Text Card (Sequential reveal) */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.4 + cIdx * 0.18 }}
                      className={`absolute ${c.labelPos} z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-2xl p-3 max-w-[190px] sm:max-w-[230px] text-left hover:scale-105 transition-transform duration-200 pointer-events-auto font-yd-gothic space-y-1`}
                    >
                      <span className="text-[8.5px] font-black text-emerald-800 uppercase tracking-widest block bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-100 font-mono">
                        {c.badge}
                      </span>
                      <h4 className="text-xs font-black text-[#062a24] tracking-tight leading-tight">
                        {c.title}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-600 leading-tight">
                        {c.text}
                      </p>
                    </motion.div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Welcome Banner Footer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#062a24] text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md"
        >
          <div className="space-y-1.5 max-w-2xl font-yd-gothic">
            <h2 className="text-lg font-extrabold flex items-center gap-2 tracking-wide">
              <Cpu size={20} className="text-emerald-300 animate-pulse" />
              ForTrace Industrial Intelligence
            </h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
              Consult multi-agent enclaves, query vector manuals, inspect graph topologies, and download cryptographically signed compliance reports.
            </p>
          </div>
          <button
            onClick={() => navigate('/ai')}
            className="px-6 py-3 bg-white hover:bg-emerald-50 text-[#062a24] rounded-xl text-xs font-black transition-all shadow-sm whitespace-nowrap cursor-pointer uppercase tracking-wider font-yd-gothic"
          >
            Launch Assistant
          </button>
        </motion.div>

      </div>
    </div>
  );
}

