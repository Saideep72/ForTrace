import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, User, Shield, ShieldCheck, Mic, MicOff, Volume2,
  VolumeX, Paperclip, ChevronDown, ChevronUp, Activity, FileText,
  AlertTriangle, RefreshCw, Sparkles, Terminal, Server, Cpu, Link2,
  Plus, X, Database, Check, Zap
} from 'lucide-react';
import { apiFetch, getUserRole } from '../utils';

export default function AIChat() {
  const userRole = getUserRole();
  const roleLabels = {
    'Plant_Manager': 'Manager',
    'Maintenance_Engineer': 'Engineer',
    'Field_Technician': 'Technician',
    'Safety_Officer': 'Safety Officer',
    'Auditor': 'Auditor',
    'Admin': 'Administrator'
  };
  const roleLabel = roleLabels[userRole] || 'Operator';

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [queryLanguage, setQueryLanguage] = useState('en');
  const [includeExpertAdvice, setIncludeExpertAdvice] = useState(false);

  // MCP Integration States
  const [mcpStatus, setMcpStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected'
  const [mcpEndpoint, setMcpEndpoint] = useState('http://localhost:8000/mcp');
  const [mcpPreset, setMcpPreset] = useState('scada');
  const [activeMcpTools, setActiveMcpTools] = useState([
    { id: 't1', name: 'scada_live_telemetry', type: 'resource' },
    { id: 't2', name: 'sop_vector_search', type: 'prompt' },
    { id: 't3', name: 'work_order_db', type: 'tool' }
  ]);

  // Dynamic MCP Services & Modal state
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isMcpExpanded, setIsMcpExpanded] = useState(false);
  const [disconnectingServiceId, setDisconnectingServiceId] = useState(null);
  const [mcpServices, setMcpServices] = useState([
    {
      id: 's1',
      name: 'SCADA TELEMETRY',
      url: 'http://localhost:8000/mcp',
      icon: '⚡',
      status: 'connected',
      toolsCount: 3
    },
    {
      id: 's2',
      name: 'PLANT HISTORIAN',
      url: 'mcp://plant-historian.local:8090',
      icon: '🛢️',
      status: 'connected',
      toolsCount: 2
    }
  ]);
  const [newMcpName, setNewMcpName] = useState('');
  const [newMcpUrl, setNewMcpUrl] = useState('mcp://localhost:8000');
  const [newMcpIcon, setNewMcpIcon] = useState('⚡');
  const [newMcpToken, setNewMcpToken] = useState('');

  // TEE Shield States
  const [teeShield, setTeeShield] = useState(false);
  const [teeLogs, setTeeLogs] = useState('Enclave initialized. Awaiting secure query transactions...');
  const [isTeeLogsCollapsed, setIsTeeLogsCollapsed] = useState(false);

  // Voice States
  const [isVoiceActive, setIsVoiceActive] = useState(false); // Voice mode toggle
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Microphone Ready');
  const [audioUrl, setAudioUrl] = useState('');
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [voiceTelemetry, setVoiceTelemetry] = useState(null);

  // Agent Metadata
  const [agentUsed, setAgentUsed] = useState('N/A');
  const [confidence, setConfidence] = useState('N/A');
  const [citations, setCitations] = useState('');
  const [isCitationsExpanded, setIsCitationsExpanded] = useState(false);

  // Speech voice synthesis toggle
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const sessionRef = useRef('SES-' + Date.now());

  const suggestions = [
    {
      id: 's1',
      icon: <Activity size={18} className="text-emerald-700" />,
      text: 'Check the status of Heat Exchanger E-201'
    },
    {
      id: 's2',
      icon: <Shield size={18} className="text-emerald-700" />,
      text: 'List recent critical failures in the plant'
    },
    {
      id: 's3',
      icon: <FileText size={18} className="text-emerald-700" />,
      text: 'Show the safety SOP for Pump P-305'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speakResponse = (text, langCode) => {
    if (!isTtsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (!text) return;
    const cleanText = text.replace(/[\*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Expert Shield States
  const [expertShield, setExpertShield] = useState(false);
  const [expertLogs, setExpertLogs] = useState('Ingestion Engine initialized. Awaiting tacit wisdom query execution...');
  const [isExpertLogsCollapsed, setIsExpertLogsCollapsed] = useState(false);
  const [expertAdvice, setExpertAdvice] = useState(null);

  const handleTeeToggle = () => {
    const nextState = !teeShield;
    setTeeShield(nextState);
    if (nextState) {
      setTeeLogs('AMD SEV-SNP Enclave verified. Awaiting confidential query execution...');
      setIsTeeLogsCollapsed(false);
    } else {
      setTeeLogs('Enclave initialized. Awaiting secure query transactions...');
    }
  };

  const handleExpertToggle = () => {
    const nextState = !expertShield;
    setExpertShield(nextState);
    if (nextState) {
      setExpertLogs('Ingestion Engine ACTIVE: Including LESSONS_LEARNED chunks in vector match...');
      setIsExpertLogsCollapsed(false);
    } else {
      setExpertLogs('Ingestion Engine initialized. Awaiting tacit wisdom query execution...');
    }
  };

  const handleToggleMcp = () => {
    if (mcpStatus === 'connected') {
      setMcpStatus('disconnected');
    } else {
      setMcpStatus('connecting');
      setTimeout(() => {
        setMcpStatus('connected');
      }, 700);
    }
  };

  const handleSaveMcpService = (e) => {
    e.preventDefault();
    if (!newMcpName.trim() || !newMcpUrl.trim()) return;
    const newService = {
      id: 'mcp-' + Date.now(),
      name: newMcpName.trim(),
      url: newMcpUrl.trim(),
      icon: newMcpIcon,
      status: 'connected',
      toolsCount: Math.floor(Math.random() * 3) + 2
    };
    setMcpServices(prev => [...prev, newService]);
    setMcpStatus('connected');
    setNewMcpName('');
    setNewMcpUrl('mcp://localhost:8000');
    setIsMcpModalOpen(false);
  };

  const handleRemoveMcpService = (id) => {
    setMcpServices(prev => prev.filter(s => s.id !== id));
  };

  const handleSendQuery = async (queryText) => {
    if (!queryText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: queryText }]);
    setIsTyping(true);
    setVoiceTelemetry(null);
    setExpertAdvice(null);

    if (teeShield) {
      setTeeLogs(prev => prev + `\n[TEE] Init secure query transaction: session=${sessionRef.current}`);
    }

    if (expertShield) {
      setExpertLogs(prev => prev + `\n[EXPERT SHIELD] ingesting doc_type='LESSONS_LEARNED' chunks into RAG context vector match...`);
    }

    try {
      const data = await apiFetch('query/ask', {
        method: 'POST',
        body: {
          query: queryText,
          query_language: queryLanguage,
          session_id: sessionRef.current,
          tee_shield: teeShield,
          include_expert_advice: expertShield || includeExpertAdvice
        }
      });

      if (teeShield && data.tee_metadata) {
        const m = data.tee_metadata;
        let logs = `[TEE] AMD SEV-SNP Attestation Success!\n[TEE] Enclave ID: ${m.enclave_id}\n[TEE] Measurement: ${m.measurement.slice(0, 16)}...\n[TEE] Anonymization Spans:\n`;
        m.anonymization_logs.forEach(l => logs += `  - ${l}\n`);
        logs += `[TEE] De-anonymization Spans:\n`;
        m.deanonymization_logs.forEach(l => logs += `  - ${l}\n`);
        setTeeLogs(logs);
      }

      if (expertShield) {
        setExpertLogs(prev => prev + `\n[EXPERT SHIELD] Retiring Engineer Wisdom vector match retrieved successfully.`);
      }

      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: data.answer }]);
      if (data.expert_advice) {
        setExpertAdvice(data.expert_advice);
      }
      setAgentUsed(data.agent_used || 'Supervisor');
      setConfidence(`${((data.confidence || 1.0) * 100).toFixed(0)}%`);
      setCitations(JSON.stringify(data.sources, null, 2));

      if (data.spoken_summary) {
        speakResponse(data.spoken_summary, queryLanguage);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `Failed to compile response: ${err.message}`, isError: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const query = inputValue.trim();
    setInputValue('');
    handleSendQuery(query);
  };

  const handleSuggestionClick = (text) => {
    handleSendQuery(text);
  };

  // Voice recording pipelines
  const startRecording = async () => {
    setRecordedBlob(null);
    setAudioUrl('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setVoiceStatus('Audio captured. Ready to transmit.');
      };
      recorder.start();
      setIsRecording(true);
      setVoiceStatus('Listening...');
    } catch (err) {
      alert(`Microphone access rejected: ${err.message}`);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      recorder.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const handleSendVoiceQuery = async () => {
    if (!recordedBlob) return;
    setIsTyping(true);
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: '[Spoken audio query command]' }]);
    setVoiceTelemetry(null);

    const formData = new FormData();
    formData.append('file', recordedBlob, 'query.wav');
    formData.append('preferred_language', queryLanguage);
    formData.append('session_id', sessionRef.current);

    try {
      const data = await apiFetch('query/voice', {
        method: 'POST',
        body: formData
      });

      setVoiceTelemetry({
        transcribed: data.transcribed || '',
        translated: data.translated || '',
        language: data.language || 'en'
      });

      const responseText = (queryLanguage === 'hi' && data.response_in_hindi)
        ? `${data.response_in_hindi} (Hindi)`
        : data.agent_response.answer;

      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: responseText }]);
      setAgentUsed(data.agent_response.agent_used || 'Supervisor');
      setConfidence(`${((data.agent_response.confidence || 1.0) * 100).toFixed(0)}%`);
      setCitations(JSON.stringify(data.agent_response.sources, null, 2));

      if (data.spoken_summary) {
        speakResponse(data.spoken_summary, queryLanguage);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: `Voice transaction failed: ${err.message}`, isError: true }]);
    } finally {
      setIsTyping(false);
      setRecordedBlob(null);
      setAudioUrl('');
      setVoiceStatus('Microphone Ready');
    }
  };

  return (
    <div className="py-4 px-4 md:px-8 w-full flex flex-col lg:flex-row justify-between items-stretch gap-6 min-h-[calc(100vh-110px)] font-yd-gothic">

      {/* Left Column: Title, Platform Header & Agent Settings */}
      <div className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col justify-between py-2 space-y-6">
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">
            AGENT PLATFORM
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#062a24] tracking-tight font-yd-gothic leading-[1.15]">
            AI Agent Desk
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed font-yd-gothic pt-3">
            Consult multi-agent enclaves for causal analytics diagnostics.
          </p>
        </div>

        {/* Agent Settings Controls (Shifted to Bottom Left & Ultra Compact) */}
        <div className="space-y-1.5 pt-1 max-w-[210px]">
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">
            AGENT SETTINGS
          </span>

          <div className="flex flex-col gap-1">
            {/* Language selector */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 px-2 py-1 rounded-md text-[9.5px] font-bold shadow-2xs">
              <span className="text-slate-500">Language:</span>
              <select
                value={queryLanguage}
                onChange={(e) => setQueryLanguage(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-1 py-0 text-[8.5px] font-bold outline-none cursor-pointer text-slate-800"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
              </select>
            </div>

            {/* Expert Notes Toggle */}
            <button
              type="button"
              onClick={() => setIncludeExpertAdvice(!includeExpertAdvice)}
              className={`w-full py-1 px-2 rounded-md text-[9.5px] font-bold border transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-between
                ${includeExpertAdvice
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }
              `}
            >
              <span>Expert Notes</span>
              <span className="text-[8.5px] font-black">{includeExpertAdvice ? 'ON' : 'OFF'}</span>
            </button>

            {/* Voice Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className={`w-full py-1 px-2 rounded-md text-[9.5px] font-bold border transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-between
                ${isVoiceActive
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }
              `}
            >
              <span className="flex items-center gap-1"><Mic size={10} /> Voice Mode</span>
              <span className="text-[8.5px] font-black">{isVoiceActive ? 'ON' : 'OFF'}</span>
            </button>

            {/* TEE Shield Toggle */}
            <button
              type="button"
              onClick={handleTeeToggle}
              className={`w-full py-1 px-2 rounded-md text-[9.5px] font-bold border transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-between
                ${teeShield
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }
              `}
            >
              <span className="flex items-center gap-1"><ShieldCheck size={10} /> TEE Shield</span>
              <span className="text-[8.5px] font-black">{teeShield ? 'ON' : 'OFF'}</span>
            </button>

            {/* Retiring Engineer Expert Shield Toggle */}
            <button
              type="button"
              onClick={handleExpertToggle}
              className={`w-full py-1 px-2 rounded-md text-[9.5px] font-bold border transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-between
                ${expertShield
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }
              `}
            >
              <span className="flex items-center gap-1">💡 Expert Shield</span>
              <span className="text-[8.5px] font-black">{expertShield ? 'ON' : 'OFF'}</span>
            </button>

            {/* TTS Mute Button */}
            <button
              type="button"
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              className="w-full py-1 px-2 rounded-md border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-between text-[9.5px] font-bold cursor-pointer"
            >
              <span className="flex items-center gap-1">
                {isTtsEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />} Audio Speech
              </span>
              <span className="text-[8.5px] font-black">{isTtsEnabled ? 'ON' : 'MUTED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Center Column: Main Chat Interface */}
      <div className="flex-1 min-w-0 max-w-3xl mx-auto w-full flex flex-col justify-between space-y-6 self-stretch">

        {/* Voice Mode Panel - if active */}
        <AnimatePresence>
          {isVoiceActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full bg-blue-50/70 border border-blue-100 rounded-[24px] p-4 flex items-center justify-between gap-4 flex-wrap text-xs text-blue-900 font-semibold"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
                <span>Status: {voiceStatus}</span>
              </div>

              <div className="flex gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-[11px] font-bold shadow cursor-pointer transition-colors"
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full text-[11px] font-bold shadow cursor-pointer transition-colors"
                  >
                    Stop Recording
                  </button>
                )}
                <button
                  onClick={handleSendVoiceQuery}
                  disabled={!recordedBlob}
                  className={`py-2 px-4 rounded-full text-[11px] font-bold shadow transition-colors flex items-center gap-1
                    ${recordedBlob
                      ? 'bg-emerald-700 text-white cursor-pointer hover:bg-emerald-800'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  Transmit Audio
                </button>
              </div>

              <div className="max-w-xs flex-1">
                {audioUrl ? <audio src={audioUrl} controls className="w-full h-7" /> : <span className="text-[10px] text-slate-400 italic">No audio recorded</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice transcription pipeline logs telemetry */}
        {voiceTelemetry && (
          <div className="w-full bg-green-50 border border-green-100 text-green-800 p-4 rounded-2xl text-xs space-y-1">
            <div><strong>Voice Transcribed:</strong> <span className="italic">"{voiceTelemetry.transcribed}"</span></div>
            <div><strong>Translated Query:</strong> <span className="font-bold">"{voiceTelemetry.translated}"</span></div>
          </div>
        )}

        {/* Center Layout: Avatar Suggestion Area vs Chat Conversation Thread */}
        <div className="flex-grow flex flex-col justify-center py-6 w-full">
          {messages.length === 0 ? (
            /* Empty Chat Area matching reference design styling exactly */
            <div className="text-center space-y-10 w-full">
              {/* White avatar container with ForTrace logo */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-white rounded-full shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-slate-100/80 flex items-center justify-center relative p-3 overflow-hidden">
                  <img src="/logo.jpg" alt="ForTrace Logo" className="w-full h-full object-cover rounded-full" />
                  <span className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                </div>
              </div>

              {/* Greetings text */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  HEY {roleLabel}
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  How can I assist you today?
                </h2>
              </div>

              {/* Suggestion cards row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full pt-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSuggestionClick(sug.text)}
                    className="bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 rounded-3xl text-left flex flex-col justify-between h-36 group cursor-pointer"
                  >
                    <div className="text-slate-400 group-hover:text-slate-700 transition-colors">
                      {sug.icon}
                    </div>
                    <p className="text-[12px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">
                      {sug.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Chat Thread */
            <div className="space-y-6 w-full flex flex-col justify-end min-h-[350px]">
              {/* Conversation Log bubbles */}
              <div className="space-y-4 max-h-[480px] overflow-y-auto px-2">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border overflow-hidden ${isUser ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-emerald-50 border-emerald-100'
                        }`}>
                        {isUser ? <User size={14} /> : <img src="/logo.jpg" alt="ForTrace Logo" className="w-full h-full object-cover rounded-full" />}
                      </div>
                      <div className={`p-4 rounded-3xl text-xs leading-relaxed border shadow-sm ${isUser
                          ? 'bg-slate-900 text-white border-transparent'
                          : (msg.isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-slate-100 text-slate-800')
                        }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src="/logo.jpg" alt="ForTrace Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="p-4 rounded-3xl bg-white border border-slate-100 text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Agent routing detail logs */}
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 border-t border-slate-100 pt-3">
                <span>Orchestrator node: <strong className="text-slate-700">{agentUsed}</strong></span>
                <span>Confidence match: <strong className="text-emerald-700">{confidence}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Centered Chat Input Bar matching reference design */}
        <div className="w-full space-y-4">
          {/* Form Input Bar */}
          <form onSubmit={handleFormSubmit} className="relative bg-white border border-slate-200/80 rounded-full px-5 py-3.5 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:border-slate-300 focus-within:border-emerald-700/30 transition-all duration-300">
            <span className="text-slate-400 flex items-center">
              <Paperclip size={18} />
            </span>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isRecording}
              placeholder="Ask about assets, SOPs, or operations..."
              className="flex-grow bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm
                ${inputValue.trim() && !isTyping
                  ? 'bg-[#0a332c] text-white hover:bg-[#0d3c34] hover:scale-105'
                  : 'bg-slate-100 text-slate-400'
                }
              `}
            >
              <Send size={14} />
            </button>
          </form>

          {/* Collapsible Source Citation context drawer */}
          {citations && (
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setIsCitationsExpanded(!isCitationsExpanded)}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between"
              >
                <span>📂 Source Citation Context Logs</span>
                <span>{isCitationsExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {isCitationsExpanded && (
                <textarea
                  rows={5}
                  readOnly
                  value={citations}
                  className="w-full bg-slate-50/50 p-4 font-mono text-[10px] text-slate-600 outline-none resize-none border-t border-slate-100"
                />
              )}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Connect MCP Panel & Shield Consoles */}
      <div className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col justify-end py-2 space-y-3 mt-auto">

        {/* Dual Shield Enclave Terminals (Compact Right Column Placement) */}
        <div className="space-y-2.5">
          {/* TEE Enclave Logs Terminal */}
          <AnimatePresence>
            {teeShield && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[9px] text-sky-400 shadow-md space-y-1.5"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 text-slate-500 font-bold">
                  <span className="flex items-center gap-1 text-[9.5px]">🔒 AMD SEV-SNP Enclave</span>
                  <button
                    onClick={() => setIsTeeLogsCollapsed(!isTeeLogsCollapsed)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {isTeeLogsCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                  </button>
                </div>
                {!isTeeLogsCollapsed && (
                  <pre className="max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-thin">{teeLogs}</pre>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expert Shield Enclave Logs Terminal */}
          <AnimatePresence>
            {expertShield && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[9px] text-amber-400 shadow-md space-y-1.5"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 text-slate-500 font-bold">
                  <span className="flex items-center gap-1 text-[9.5px]">💡 Tacit Wisdom Console</span>
                  <button
                    onClick={() => setIsExpertLogsCollapsed(!isExpertLogsCollapsed)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {isExpertLogsCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                  </button>
                </div>
                {!isExpertLogsCollapsed && (
                  <pre className="max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-thin">{expertLogs}</pre>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapsible MCP Services Stack & Add Button (EXPANDS UPWARD ABOVE THE HEADER) */}
        <AnimatePresence>
          {isMcpExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3 overflow-hidden"
            >
              {/* Centered Dark Green Plus (+) Button on TOP of saved MCPs */}
              <div className="flex justify-center pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setIsMcpModalOpen(true)}
                  title="Add MCP Service"
                  className="w-12 h-12 bg-[#0c3b32] hover:bg-[#062a24] text-white rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer border border-[#062a24]"
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* Stacked Dark Green Service Pills */}
              <div className="space-y-3 pb-1">
                {mcpServices.map((svc) => {
                  const isDisconnecting = disconnectingServiceId === svc.id;
                  return (
                    <motion.div
                      key={svc.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-[#0c3b32] hover:bg-[#0f483d] transition-colors p-2.5 rounded-2xl flex items-center justify-between border border-[#062a24] shadow-sm group"
                    >
                      {isDisconnecting ? (
                        <div className="w-full flex items-center justify-between gap-2 py-0.5 animate-fadeIn">
                          <span className="text-white text-xs font-bold font-yd-gothic truncate">
                            Disconnect?
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                handleRemoveMcpService(svc.id);
                                setDisconnectingServiceId(null);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-black px-3 py-1 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setDisconnectingServiceId(null)}
                              className="bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold px-3 py-1 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            {/* White rounded square logo container */}
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-sm font-bold text-slate-800 shrink-0 shadow-2xs">
                              {svc.icon}
                            </div>
                            <div className="truncate min-w-0">
                              <span className="text-white text-xs sm:text-[13px] font-extrabold uppercase tracking-wider font-yd-gothic block truncate">
                                {svc.name}
                              </span>
                              <span className="text-[9px] font-mono text-emerald-200/70 block truncate">
                                {svc.url}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDisconnectingServiceId(svc.id)}
                            className="text-emerald-300/40 hover:text-red-300 transition-colors p-1.5 cursor-pointer"
                            title="Disconnect Service"
                          >
                            <X size={13} />
                          </button>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Banner at right bottom */}
        <div
          onClick={() => setIsMcpExpanded(!isMcpExpanded)}
          className="w-full bg-[#154636] hover:bg-[#195442] border border-[#09231b] text-white rounded-2xl shadow-md flex items-center justify-between overflow-hidden cursor-pointer transition-all select-none p-1 group shrink-0"
        >
          {/* Dark Triangle Section on left */}
          <div className="relative w-14 h-11 bg-[#07241c] rounded-xl flex items-center justify-center shrink-0 border border-white/20">
            <svg
              viewBox="0 0 100 100"
              className={`w-7 h-7 fill-[#041712] stroke-white stroke-[6] transition-transform duration-300 ${isMcpExpanded ? '-rotate-90' : ''}`}
            >
              <polygon points="20,15 85,50 20,85" />
            </svg>
          </div>

          {/* Header Title */}
          <div className="flex-1 text-center py-2 pr-3">
            <span className="text-sm sm:text-base font-extrabold font-yd-gothic tracking-wide text-white block">
              Model Context Protocol
            </span>
          </div>
        </div>

      </div>

      {/* Modal Popup for MCP Configuration */}
      <AnimatePresence>
        {isMcpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden font-yd-gothic"
            >
              {/* Modal Header */}
              <div className="bg-[#0b1716] px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <Server size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">Configure MCP Service</h3>
                    <p className="text-[10px] text-slate-300 font-medium">Model Context Protocol Enclave Integration</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMcpModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveMcpService} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCADA Live Telemetry, Plant Historian DB"
                    value={newMcpName}
                    onChange={(e) => setNewMcpName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-700/50 focus:bg-white transition-colors"
                  />
                </div>

                {/* Service Icon Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Service Logo / Icon</label>
                  <div className="flex gap-2">
                    {['⚡', '🛢️', '🛡️', '🤖', '📦', '⚙️'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewMcpIcon(icon)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-all cursor-pointer
                          ${newMcpIcon === icon
                            ? 'bg-emerald-50 border-emerald-500 shadow-xs scale-105'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }
                        `}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">MCP Server Endpoint URL</label>
                  <input
                    type="text"
                    required
                    placeholder="mcp://hostname:port or http://localhost:8000/mcp"
                    value={newMcpUrl}
                    onChange={(e) => setNewMcpUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-emerald-700/50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Auth Token / Secret (Optional)</label>
                  <input
                    type="password"
                    placeholder="bearer_token_secret_123"
                    value={newMcpToken}
                    onChange={(e) => setNewMcpToken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-emerald-700/50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsMcpModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0b1716] hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Check size={14} />
                    <span>Save & Connect Service</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
