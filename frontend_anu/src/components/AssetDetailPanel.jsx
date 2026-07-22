import React from 'react';
import { X, UploadCloud, Thermometer, Activity } from 'lucide-react';
import { getUserRole } from '../utils';

export default function AssetDetailPanel({ asset, onClose }) {
  if (!asset) return null;

  const role = getUserRole();
  const canUpload = role !== 'Field_Technician' && role !== 'Auditor';

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity" 
      />
      
      {/* Detail Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white/75 backdrop-blur-md shadow-2xl z-50 flex flex-col transition-transform transform translate-x-0 border-l border-[var(--c-border)]">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--c-border)] flex justify-between items-center bg-white/50">
          <h2 className="text-xl font-bold text-[#0d3a35]">Asset Details</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(39,97,82,0.1)] text-[#0d3a35] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="h-48 rounded-xl bg-cover bg-center shadow-inner" style={{ backgroundImage: `url(${asset.image})` }} />
          
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-extrabold text-[#0d3a35]">{asset.tag || asset.id}</h1>
              <div className="px-3 py-1 rounded-full text-sm font-bold bg-white/80 shadow-sm text-[#276152] border border-[#b1b7ab]">
                {asset.status}
              </div>
            </div>
            <p className="text-[#0d3a35]/80 font-semibold mt-1">{asset.type} • {asset.plant}</p>
          </div>
          
          <p className="text-[#0d3a35]/70 leading-relaxed text-sm">
            {asset.description || 'Detailed operational and structural parameters for this asset component.'}
          </p>
          
          {/* Telemetry Widgets */}
          <h3 className="text-xs font-bold text-[#b1b7ab] uppercase tracking-wider">Live Telemetry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/60 rounded-xl border border-[#b1b7ab]/50 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0d3a35]/60 mb-2">
                <Thermometer size={14}/> TEMP
              </div>
              <div className="text-xl font-extrabold text-[#0d3a35]">{asset.temp || 'N/A'}</div>
            </div>
            <div className="p-4 bg-white/60 rounded-xl border border-[#b1b7ab]/50 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0d3a35]/60 mb-2">
                <Activity size={14}/> VIBRATION
              </div>
              <div className="text-xl font-extrabold text-[#0d3a35]">{asset.vibration || 'N/A'}</div>
            </div>
          </div>

          {/* File Uploader Drop-zone */}
          {canUpload && (
            <div className="mt-8 pt-6 border-t border-[#b1b7ab]/40">
              <h3 className="text-sm font-bold text-[#0d3a35] mb-3">Upload Documents</h3>
              <div className="w-full h-32 border-2 border-dashed border-[#b1b7ab] rounded-xl bg-white/40 flex flex-col items-center justify-center text-[#0d3a35]/70 cursor-pointer hover:bg-white/80 hover:border-[#276152] transition-colors group">
                <UploadCloud size={32} className="mb-2 group-hover:text-[#276152] transition-colors" /> 
                <span className="text-sm font-bold group-hover:text-[#276152] transition-colors">
                  Click to browse or drag and drop
                </span>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </>
  );
}
