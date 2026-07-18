import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, Network as NetworkIcon, Activity,
  Settings, Clock, FileText, Link2, ArrowRight
} from 'lucide-react';
import { Network } from 'vis-network';

import HeaderBar from '../components/HeaderBar';


const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } }
};

const detailsVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

const MOCK_NODES = [
  { id: 'pump101', label: 'Pump-101', type: 'pump', group: 'healthy', assetId: 'FT-PU-101', health: 'Healthy', connected: 12, docs: 7, deps: 5, lastMaint: '12 May 2026', nextMaint: '12 Nov 2026' },
  { id: 'boiler02', label: 'Boiler-02', type: 'boiler', group: 'warning', assetId: 'FT-BO-002', health: 'Warning', connected: 8, docs: 4, deps: 3, lastMaint: '01 Jan 2026', nextMaint: '01 Jul 2026' },
  { id: 'conveyor03', label: 'Conveyor-03', type: 'conveyor', group: 'critical', assetId: 'FT-CO-003', health: 'Critical', connected: 15, docs: 12, deps: 8, lastMaint: '15 Aug 2025', nextMaint: 'OVERDUE' },
  { id: 'furnace01', label: 'Furnace-01', type: 'furnace', group: 'healthy', assetId: 'FT-FU-001', health: 'Healthy', connected: 5, docs: 2, deps: 2, lastMaint: '22 Feb 2026', nextMaint: '22 Feb 2027' },
  { id: 'valveA', label: 'Valve-A', type: 'valve', group: 'healthy', assetId: 'FT-VA-001', health: 'Healthy', connected: 3, docs: 1, deps: 1, lastMaint: '10 Mar 2026', nextMaint: '10 Sep 2026' }
];

const MOCK_EDGES = [
  { from: 'pump101', to: 'boiler02' },
  { from: 'boiler02', to: 'conveyor03' },
  { from: 'conveyor03', to: 'furnace01' },
  { from: 'pump101', to: 'valveA' },
  { from: 'valveA', to: 'boiler02' }
];

function InteractiveGraph({ searchQuery, filterType, onNodeSelect }) {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;

    // Filter nodes based on search and type
    const filteredNodes = MOCK_NODES.filter(n => {
      if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase()) && !n.assetId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterType && n.type !== filterType) return false;
      return true;
    });

    // Only keep edges where both from and to nodes exist in the filtered set
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = MOCK_EDGES.filter(e => nodeIds.has(e.from) && nodeIds.has(e.to));

    const options = {
      nodes: {
        shape: 'dot',
        size: 14,
        font: { size: 12, color: '#212529', face: 'Inter' },
        borderWidth: 2,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', size: 8, x: 0, y: 4 }
      },
      edges: {
        width: 1.5,
        color: { color: '#cbd5e1', highlight: 'hsl(210, 55%, 55%)' },
        smooth: { type: 'continuous' }
      },
      groups: {
        healthy: { color: { background: '#fff', border: '#22c55e' } },
        warning: { color: { background: '#fff', border: '#f59e0b' } },
        critical: { color: { background: '#fff', border: '#ef4444' } }
      },
      physics: {
        stabilization: true,
        barnesHut: { springLength: 150, springConstant: 0.05 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: false,
        dragView: false
      }
    };

    const network = new Network(container.current, { nodes: filteredNodes, edges: filteredEdges }, options);

    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const selectedId = params.nodes[0];
        const nodeData = MOCK_NODES.find(n => n.id === selectedId);
        onNodeSelect(nodeData);
      } else {
        onNodeSelect(null);
      }
    });

    // Add magnetic hover effect class to canvas container
    container.current.querySelector('canvas').style.cursor = 'crosshair';

    return () => network.destroy();
  }, [searchQuery, filterType, onNodeSelect]);

  return <div ref={container} style={{ width: '100%', height: '100%', outline: 'none' }} />;
}

export default function NetworkAnalysis() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Interactive state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlant, setFilterPlant] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);

  const handleReset = () => {
    setSearchQuery('');
    setFilterPlant('');
    setFilterType('');
    setFilterRelationship('');
    setSelectedNode(null);
  };

  return (
    <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>

      <main className="main-content">
        <HeaderBar />

        <motion.div initial="initial" animate="animate" variants={pageVariants} style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1.5rem', height: '100vh', paddingTop: '80px' }}>

          {/* Header & Controls Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', flexShrink: 0 }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--c-text)' }}>
              Network Assets
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search Asset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', background: 'rgba(0,0,0,0.03)', border: '1px solid transparent', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }}
                  onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--c-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.background = 'rgba(0,0,0,0.03)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ width: '1px', height: '32px', background: 'var(--c-border)', margin: '0 0.5rem' }}></div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)' }}>
                Filters:
                <select
                  value={filterPlant}
                  onChange={(e) => setFilterPlant(e.target.value)}
                  className="btn"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--c-text-secondary)', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23495057%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto', paddingRight: '2rem' }}
                >
                  <option value="">Plant</option>
                  <option value="plantA">Plant A</option>
                  <option value="plantB">Plant B</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="btn"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--c-text-secondary)', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23495057%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto', paddingRight: '2rem' }}
                >
                  <option value="">Asset Type</option>
                  <option value="pump">Pump</option>
                  <option value="boiler">Boiler</option>
                  <option value="conveyor">Conveyor</option>
                  <option value="furnace">Furnace</option>
                  <option value="valve">Valve</option>
                </select>
                <select
                  value={filterRelationship}
                  onChange={(e) => setFilterRelationship(e.target.value)}
                  className="btn"
                  style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--c-text-secondary)', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23495057%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto', paddingRight: '2rem' }}
                >
                  <option value="">Relationship</option>
                  <option value="direct">Directly Connected</option>
                  <option value="upstream">Upstream</option>
                  <option value="downstream">Downstream</option>
                </select>
                <button onClick={handleReset} className="btn" style={{ background: 'transparent', border: 'none', color: 'var(--c-primary)', padding: '0.4rem 0.75rem', fontWeight: 600 }}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Graph & Details Section */}
          <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: '600px', flexShrink: 0 }}>

            {/* Main Graph Area */}
            <div className="card" style={{ flex: 1, borderRadius: '16px', display: 'flex', flexDirection: 'column', background: 'var(--c-surface)', padding: '1.5rem' }}>
              <div style={{ flex: 1, position: 'relative', minHeight: 0, border: '1px solid var(--c-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <InteractiveGraph
                    searchQuery={searchQuery}
                    filterType={filterType}
                    onNodeSelect={setSelectedNode}
                  />
                </div>
              </div>
            </div>

            {/* Details Panel */}
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key="details"
                  variants={detailsVariants}
                  initial="initial" animate="animate" exit="exit"
                  className="card"
                  style={{ width: '340px', borderRadius: '16px', display: 'flex', flexDirection: 'column', background: 'var(--c-surface)', overflow: 'hidden' }}
                >
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(to bottom, rgba(37,99,235,0.03), transparent)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--c-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Network Details
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--c-text)' }}>{selectedNode.label}</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Asset ID: <span style={{ fontWeight: 600, color: 'var(--c-text)', fontFamily: 'monospace' }}>{selectedNode.assetId}</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>

                    {/* Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--c-text-secondary)', fontWeight: 500 }}>Health Status</span>
                      <span className={`badge ${selectedNode.health === 'Healthy' ? 'badge-success' : selectedNode.health === 'Warning' ? 'badge-warning' : 'badge-danger'}`} style={{ padding: '0.4rem 0.8rem' }}>
                        <span className="badge-dot"></span> {selectedNode.health}
                      </span>
                    </div>

                    <div style={{ height: '1px', background: 'var(--c-border)', margin: '1.5rem 0' }}></div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--c-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                          <Link2 size={18} color="var(--c-primary)" /> Connected Assets
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)' }}>{selectedNode.connected}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--c-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                          <FileText size={18} color="var(--c-accent)" /> Documents
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)' }}>{selectedNode.docs}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--c-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                          <Activity size={18} color="var(--c-text-muted)" /> Dependencies
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)' }}>{selectedNode.deps}</span>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: 'var(--c-border)', margin: '1.5rem 0' }}></div>

                    {/* Maintenance */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>Last Maintenance</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={14} /> {selectedNode.lastMaint}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>Next Maintenance</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: selectedNode.nextMaint === 'OVERDUE' ? 'var(--c-danger)' : 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Settings size={14} /> {selectedNode.nextMaint}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', borderTop: '1px solid var(--c-border)' }}>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>View Full Profile</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="card"
                  style={{ width: '340px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--c-surface)', padding: '2rem', textAlign: 'center' }}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--c-text-muted)' }}>
                    <NetworkIcon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--c-text)', marginBottom: '0.5rem' }}>No Node Selected</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--c-text-secondary)', lineHeight: 1.5 }}>
                    Click on any node in the graph to view its detailed network information.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>
      </main>
    </div>
  );
}