import React, { useState, useEffect, useRef } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Maximize, GitPullRequest, LayoutGrid, CheckSquare, 
  HelpCircle, AlertTriangle, FileText, Settings, Database, X 
} from 'lucide-react';
import { apiFetch } from '../utils';

export default function NetworkAnalysis() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const visNodesRef = useRef(null);
  const visEdgesRef = useRef(null);

  // Filters and Control States
  const [keyword, setKeyword] = useState('');
  const [depth, setDepth] = useState('2'); // '1', '2', or 'full'
  const [showDocs, setShowDocs] = useState(false);
  const [showOps, setShowOps] = useState(true);

  // Sidebar metrics
  const [metrics, setMetrics] = useState({
    assets: 0,
    docs: 0,
    failures: 0,
    workOrders: 0,
    inspections: 0,
    alarms: 0,
    centralNode: '—',
    centralCount: '—'
  });

  // Selected Node details state & Popover position
  const [selectedNodeData, setSelectedNodeData] = useState(null);
  const [selectedNodeNeighbors, setSelectedNodeNeighbors] = useState(null);
  const [neighborsLoading, setNeighborsLoading] = useState(false);
  const [popoverPos, setPopoverPos] = useState(null);
  const selectedNodeIdRef = useRef(null);

  // Success summary banner
  const [summaryMessage, setSummaryMessage] = useState('');
  const [loadingGraph, setLoadingGraph] = useState(false);

  // Hold raw topology data for calculations
  const rawTopologyRef = useRef(null);
  const filteredNodesRef = useRef([]);
  const filteredEdgesRef = useRef([]);

  // Fetch and compile graph topology on load or control changes
  const fetchGraphTopology = async () => {
    setLoadingGraph(true);
    setSummaryMessage('');
    try {
      const data = await apiFetch('graph/topology');
      rawTopologyRef.current = data;
      renderGraph(data);
    } catch (err) {
      console.error("Failed to fetch topology:", err);
      setSummaryMessage(`Error loading topology graph: ${err.message}`);
    } finally {
      setLoadingGraph(false);
    }
  };

  // What-If Cascade Stress Tester States
  const [simAssets, setSimAssets] = useState([]);
  const [selectedSimAsset, setSelectedSimAsset] = useState('');
  const [simScenario, setSimScenario] = useState('fouling_shutdown');
  const [simResults, setSimResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simError, setSimError] = useState('');

  // Fetch simulation asset dropdown list
  const loadSimAssets = async () => {
    try {
      const data = await apiFetch('simulation/assets-list');
      if (data && data.assets) {
        setSimAssets(data.assets);
        if (data.assets.length > 0) {
          setSelectedSimAsset(data.assets[0].uat);
        }
      }
    } catch (e) {
      console.warn('Simulation assets load failed:', e.message);
    }
  };

  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSimAsset) {
      setSimError('Please select an asset to simulate.');
      return;
    }
    setIsSimulating(true);
    setSimError('');
    setSimResults(null);
    try {
      const data = await apiFetch('simulation/cascade-trip', {
        method: 'POST',
        body: {
          source_uat: selectedSimAsset,
          trip_scenario: simScenario
        }
      });
      setSimResults(data);
    } catch (err) {
      setSimError(err.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Run initial fetch on mount
  useEffect(() => {
    fetchGraphTopology();
    loadSimAssets();
  }, []);

  // Equipment-type color helper matching legend
  const getAssetColor = (type) => {
    if (!type) return { bg: '#8b5cf6', border: '#6d28d9' };
    const t = type.toLowerCase();
    if (t.includes('boiler') || t.includes('furnace') || t.includes('heater'))
      return { bg: '#ef4444', border: '#b91c1c' };
    if (t.includes('pump') || t.includes('compressor') || t.includes('blower') || t.includes('fan'))
      return { bg: '#3b82f6', border: '#1d4ed8' };
    if (t.includes('heat exchanger') || t.includes('condenser') || t.includes('cooler'))
      return { bg: '#10b981', border: '#065f46' };
    if (t.includes('reactor') || t.includes('tank') || t.includes('vessel') || t.includes('column') || t.includes('tower'))
      return { bg: '#f59e0b', border: '#b45309' };
    return { bg: '#8b5cf6', border: '#6d28d9' };
  };

  const renderGraph = (data) => {
    if (!containerRef.current || !data) return;

    let nodes = data.nodes || [];
    let edges = data.edges || [];

    // Filter nodes/edges based on showDocs and showOps toggles
    const assetNodes = nodes.filter(n => n.group === 'assets');
    const docNodes = nodes.filter(n => n.group === 'documents');
    const failNodes = nodes.filter(n => n.group === 'failures');
    const woNodes = nodes.filter(n => n.group === 'work_orders');
    const inspNodes = nodes.filter(n => n.group === 'inspections');
    const alarmNodes = nodes.filter(n => n.group === 'alarms');

    const depEdges = edges.filter(e => e.label !== 'HAS_DOCUMENT' && e.label !== 'HAS_FAILURE' && e.label !== 'HAS_WORK_ORDER' && e.label !== 'HAS_INSPECTION' && e.label !== 'HAS_ALARM');
    const docEdges = edges.filter(e => e.label === 'HAS_DOCUMENT');
    const failEdges = edges.filter(e => e.label === 'HAS_FAILURE');
    const woEdges = edges.filter(e => e.label === 'HAS_WORK_ORDER');
    const inspEdges = edges.filter(e => e.label === 'HAS_INSPECTION');
    const alarmEdges = edges.filter(e => e.label === 'HAS_ALARM');

    // Degree centrality using asset edges
    const edgeCounts = {};
    assetNodes.forEach(n => edgeCounts[n.id] = 0);
    depEdges.forEach(e => {
      if (edgeCounts[e.from] !== undefined) edgeCounts[e.from]++;
      if (edgeCounts[e.to] !== undefined) edgeCounts[e.to]++;
    });

    let maxNodeId = null, maxCount = 0;
    for (const id in edgeCounts) {
      if (edgeCounts[id] > maxCount) {
        maxCount = edgeCounts[id];
        maxNodeId = id;
      }
    }
    const centralNode = assetNodes.find(n => n.id === maxNodeId);

    // Update counters in state
    setMetrics({
      assets: assetNodes.length,
      docs: docNodes.length,
      failures: failNodes.length,
      workOrders: woNodes.length,
      inspections: inspNodes.length,
      alarms: alarmNodes.length,
      centralNode: centralNode ? centralNode.label : '—',
      centralCount: maxCount || '—'
    });

    // Assemble dynamic set based on toggles
    let compiledNodes = [...assetNodes];
    let compiledEdges = [...depEdges];

    if (showDocs) {
      compiledNodes.push(...docNodes);
      compiledEdges.push(...docEdges);
    }
    if (showOps) {
      compiledNodes.push(...failNodes, ...woNodes, ...inspNodes, ...alarmNodes);
      compiledEdges.push(...failEdges, ...woEdges, ...inspEdges, ...alarmEdges);
    }

    // Apply keyword and depth filters if specified
    if (depth !== 'full' && keyword && keyword.trim() !== '') {
      const tokens = keyword.toLowerCase().split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
      if (tokens.length > 0) {
        const matched = new Set();
        compiledNodes.forEach(n => {
          const lbl = String(n.label || '').toLowerCase();
          const id = String(n.id || '').toLowerCase();
          const mfr = String(n.properties?.manufacturer || '').toLowerCase();
          const type = String(n.properties?.type || '').toLowerCase();
          const docType = String(n.properties?.doc_type || '').toLowerCase();

          const matchesToken = tokens.some(token => 
            lbl.includes(token) || 
            id.includes(token) || 
            mfr.includes(token) || 
            type.includes(token) ||
            docType.includes(token)
          );
          if (matchesToken) matched.add(n.id);
        });

        const expanded = new Set(matched);
        if (depth === '1') {
          compiledEdges.forEach(e => {
            if (matched.has(e.from)) expanded.add(e.to);
            if (matched.has(e.to)) expanded.add(e.from);
          });
        } else if (depth === '2') {
          let currentSet = new Set(matched);
          for (let hop = 0; hop < 2; hop++) {
            let nextSet = new Set();
            compiledEdges.forEach(e => {
              if (currentSet.has(e.from) && !expanded.has(e.to)) {
                expanded.add(e.to);
                nextSet.add(e.to);
              }
              if (currentSet.has(e.to) && !expanded.has(e.from)) {
                expanded.add(e.from);
                nextSet.add(e.from);
              }
            });
            currentSet = nextSet;
          }
        }

        compiledNodes = compiledNodes.filter(n => expanded.has(n.id));
        compiledEdges = compiledEdges.filter(e => expanded.has(e.from) && expanded.has(e.to));
      }
    }

    filteredNodesRef.current = compiledNodes;
    filteredEdgesRef.current = compiledEdges;

    setSummaryMessage(`Topology graph loaded. Showing ${compiledNodes.filter(n=>n.group==='assets').length} asset nodes, ${compiledNodes.filter(n=>n.group==='documents').length} documents, ${compiledNodes.filter(n=>n.group==='failures').length} failures, ${compiledNodes.filter(n=>n.group==='work_orders').length} work orders, ${compiledNodes.filter(n=>n.group==='inspections').length} inspections, ${compiledNodes.filter(n=>n.group==='alarms').length} alarms, and ${compiledEdges.length} edges.`);

    // Build Vis.js datasets
    const visNodes = new DataSet(compiledNodes.map(n => {
      if (n.group === 'assets') {
        const eq_type = n.properties?.type || '';
        const color = getAssetColor(eq_type);
        return {
          id: n.id,
          label: n.label,
          shape: 'dot',
          color: { background: color.bg, border: color.border, highlight: { background: '#fbbf24', border: '#d97706' } },
          font: { size: 11, face: 'Inter', color: '#0f172a' },
          size: 18 + Math.min((edgeCounts[n.id] || 0) * 1.5, 16),
          properties: n.properties,
          groupName: 'assets'
        };
      } else if (n.group === 'documents') {
        return {
          id: n.id,
          label: n.label,
          shape: 'dot',
          color: { background: '#94a3b8', border: '#64748b', highlight: { background: '#fbbf24', border: '#d97706' } },
          font: { size: 9, face: 'Inter', color: '#475569' },
          size: 8,
          properties: n.properties,
          groupName: 'documents'
        };
      } else if (n.group === 'failures') {
        return {
          id: n.id,
          label: n.label,
          shape: 'triangle',
          color: { background: '#ef4444', border: '#b91c1c', highlight: { background: '#fbbf24', border: '#d97706' } },
          font: { size: 10, face: 'Inter', color: '#7f1d1d' },
          size: 14,
          properties: n.properties,
          groupName: 'failures'
        };
      } else if (n.group === 'work_orders') {
        return {
          id: n.id,
          label: n.label,
          shape: 'square',
          color: { background: '#10b981', border: '#047857', highlight: { background: '#fbbf24', border: '#d97706' } },
          font: { size: 10, face: 'Inter', color: '#064e3b' },
          size: 12,
          properties: n.properties,
          groupName: 'work_orders'
        };
      } else if (n.group === 'inspections') {
        return {
          id: n.id,
          label: n.label,
          shape: 'diamond',
          color: { background: '#06b6d4', border: '#0891b2', highlight: { background: '#fbbf24', border: '#d97706' } },
          font: { size: 10, face: 'Inter', color: '#164e63' },
          size: 12,
          properties: n.properties,
          groupName: 'inspections'
        };
      } else { // alarms
        return {
          id: n.id,
          label: n.label,
          shape: 'star',
          color: { background: '#f97316', border: '#ea580c', highlight: { background: '#fbbf24', border: '#d97706' } },
          font: { size: 10, face: 'Inter', color: '#7c2d12' },
          size: 14,
          properties: n.properties,
          groupName: 'alarms'
        };
      }
    }));

    const visEdges = new DataSet(compiledEdges.map(e => {
      const isDocLink = e.label === 'HAS_DOCUMENT';
      const isOpLink = ['HAS_FAILURE', 'HAS_WORK_ORDER', 'HAS_INSPECTION', 'HAS_ALARM'].includes(e.label);
      
      let edgeColor = '#64748b';
      if (isDocLink) edgeColor = '#cbd5e1';
      else if (e.label === 'HAS_FAILURE') edgeColor = '#fca5a5';
      else if (e.label === 'HAS_WORK_ORDER') edgeColor = '#a7f3d0';
      else if (e.label === 'HAS_INSPECTION') edgeColor = '#a5f3fc';
      else if (e.label === 'HAS_ALARM') edgeColor = '#fed7aa';

      return {
        id: e.id,
        from: e.from,
        to: e.to,
        color: { color: edgeColor, highlight: '#f59e0b', opacity: isDocLink ? 0.5 : 0.9 },
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
        width: isDocLink ? 1 : (isOpLink ? 1.2 : 1.8),
        dashes: isDocLink || isOpLink,
        smooth: { type: 'dynamic' }
      };
    }));

    visNodesRef.current = visNodes;
    visEdgesRef.current = visEdges;

    const options = {
      nodes: { borderWidth: 2 },
      edges: { smooth: { type: 'dynamic' } },
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -70,
          centralGravity: 0.015,
          springLength: 100,
          springConstant: 0.08,
          damping: 0.4
        },
        stabilization: { iterations: 200 }
      },
      interaction: {
        hover: true,
        tooltipDelay: 150,
        selectConnectedEdges: true,
        navigationButtons: false
      },
      layout: { improvedLayout: true }
    };

    const updatePopoverPos = (nodeId) => {
      const activeId = nodeId || selectedNodeIdRef.current;
      if (!activeId || !networkRef.current || !containerRef.current) return;
      try {
        const pos = networkRef.current.getPosition(activeId);
        const domPos = networkRef.current.canvasToDOM(pos);
        const containerWidth = containerRef.current.offsetWidth || 700;
        const containerHeight = containerRef.current.offsetHeight || 580;
        
        const cardWidth = Math.min(360, containerWidth - 30);
        const cardHeight = Math.min(460, containerHeight - 30);

        let x = domPos.x + 20;
        if (x + cardWidth > containerWidth - 15) {
          x = domPos.x - cardWidth - 20;
        }
        x = Math.max(15, Math.min(x, containerWidth - cardWidth - 15));

        let y = domPos.y - 20;
        if (y + cardHeight > containerHeight - 15) {
          y = domPos.y - cardHeight + 20;
        }
        y = Math.max(15, Math.min(y, containerHeight - cardHeight - 15));

        setPopoverPos({ x, y });
      } catch (e) {
        // Position unavailable
      }
    };

    const highlightSubnetwork = (nodeId) => {
      const connectedNodes = new Set([nodeId]);
      compiledEdges.forEach(e => {
        if (e.from === nodeId) connectedNodes.add(e.to);
        if (e.to === nodeId) connectedNodes.add(e.from);
      });

      const nodesUpdate = compiledNodes.map(n => ({
        id: n.id,
        opacity: connectedNodes.has(n.id) ? 1.0 : 0.02,
        borderWidth: n.id === nodeId ? 4 : 2
      }));
      visNodes.update(nodesUpdate);

      const edgesUpdate = compiledEdges.map(e => {
        const isConnected = e.from === nodeId || e.to === nodeId;
        return {
          id: e.id,
          color: { opacity: isConnected ? 1.0 : 0.0 },
          width: isConnected ? (e.label === 'HAS_DOCUMENT' ? 1.5 : 2.5) : 0.5
        };
      });
      visEdges.update(edgesUpdate);
    };

    const resetSubnetwork = () => {
      if (selectedNodeIdRef.current) {
        highlightSubnetwork(selectedNodeIdRef.current);
      } else {
        const nodesReset = compiledNodes.map(n => ({ id: n.id, opacity: 1.0, borderWidth: 2 }));
        visNodes.update(nodesReset);

        const edgesReset = compiledEdges.map(e => {
          const isDocLink = e.label === 'HAS_DOCUMENT';
          const isOpLink = ['HAS_FAILURE', 'HAS_WORK_ORDER', 'HAS_INSPECTION', 'HAS_ALARM'].includes(e.label);
          return {
            id: e.id,
            color: { opacity: isDocLink ? 0.5 : 0.9 },
            width: isDocLink ? 1 : (isOpLink ? 1.2 : 1.8)
          };
        });
        visEdges.update(edgesReset);
      }
    };

    const network = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, options);
    networkRef.current = network;

    network.on('dragging', () => updatePopoverPos());
    network.on('zoom', () => updatePopoverPos());

    // Highlight subnetwork on hover
    network.on('hoverNode', (params) => {
      highlightSubnetwork(params.node);
    });

    network.on('blurNode', () => {
      resetSubnetwork();
    });

    // Handle clicking a node to trace causal paths and fetch neighbors
    network.on('click', async (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        selectedNodeIdRef.current = nodeId;
        const node = visNodes.get(nodeId);
        setSelectedNodeData(node);
        setSelectedNodeNeighbors(null);
        updatePopoverPos(nodeId);

        // Fetch neighbor diagnostics if it's an asset
        if (node.groupName === 'assets') {
          setNeighborsLoading(true);
          try {
            const data = await apiFetch(`graph/neighbors/${nodeId}`);
            setSelectedNodeNeighbors(data);
          } catch (err) {
            console.warn("Failed to load neighbors:", err);
          } finally {
            setNeighborsLoading(false);
          }
        }

        // Highlight ONLY connected paths (hide all others)
        highlightSubnetwork(nodeId);

      } else {
        handleClosePopover(visNodes, compiledNodes, visEdges, compiledEdges);
      }
    });
  };

  const handleClosePopover = (vNodes, cNodes, vEdges, cEdges) => {
    selectedNodeIdRef.current = null;
    setSelectedNodeData(null);
    setSelectedNodeNeighbors(null);
    setPopoverPos(null);

    const visNodes = vNodes || visNodesRef.current;
    const compiledNodes = cNodes || rawTopologyRef.current?.nodes || [];
    const visEdges = vEdges || visEdgesRef.current;
    const compiledEdges = cEdges || rawTopologyRef.current?.edges || [];

    if (visNodes && compiledNodes.length > 0) {
      const nodesReset = compiledNodes.map(n => ({ id: n.id, opacity: 1.0, borderWidth: 2 }));
      visNodes.update(nodesReset);
    }
    if (visEdges && compiledEdges.length > 0) {
      const edgesReset = compiledEdges.map(e => {
        const isDocLink = e.label === 'HAS_DOCUMENT';
        const isOpLink = ['HAS_FAILURE', 'HAS_WORK_ORDER', 'HAS_INSPECTION', 'HAS_ALARM'].includes(e.label);
        return {
          id: e.id,
          color: { opacity: isDocLink ? 0.5 : 0.9 },
          width: isDocLink ? 1 : (isOpLink ? 1.2 : 1.8)
        };
      });
      visEdges.update(edgesReset);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (rawTopologyRef.current) {
      renderGraph(rawTopologyRef.current);
    }
  };

  const fitGraphView = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    } else {
      alert("Please fetch the network graph first.");
    }
  };

  const selectNodeInGraph = (nodeId) => {
    const network = networkRef.current;
    const visNodes = visNodesRef.current;
    if (network && visNodes) {
      network.selectNodes([nodeId]);
      network.fire('click', { nodes: [nodeId] });
      network.focus(nodeId, {
        scale: 1.15,
        animation: { duration: 750, easingFunction: 'easeInOutQuad' }
      });
    }
  };

  return (
    <div className="py-6 px-2 md:px-6 w-full max-w-full space-y-8 font-yd-gothic">
      {/* Hero Header matching Document Registry design */}
      <div className="relative py-6 px-2 text-center space-y-2.5 overflow-hidden bg-transparent">
        {/* Subtle grid pattern background accent */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]"></div>

        <div className="relative z-10 space-y-3 max-w-full mx-auto py-4">
          <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">
            PLANT TOPOLOGY & GRAPH INTELLIGENCE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#062a24] tracking-tight font-yd-gothic leading-[0.95]">
            Asset Relationship Network Analysis
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto pt-2 font-yd-gothic">
            Live plant topology compiled from Supabase PostgreSQL. Click any node to trace upstream and downstream connections across asset dependencies.
          </p>
        </div>
      </div>

      {/* Summary message banner */}
      {summaryMessage && (
        <div className="bg-sky-50 border border-sky-100 text-sky-800 p-3 rounded-xl text-xs font-semibold">
          {summaryMessage}
        </div>
      )}

      {/* Main Grid: Canvas + Right Controls & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Graph Canvas */}
        <div className="lg:col-span-3 space-y-3">
          {/* Legend row */}
          <div className="bg-bgMain/30 border border-borderMain rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-textMuted items-center select-none shadow-sm">
            <span className="text-[11px] font-extrabold text-textMain mr-1 uppercase">Legend:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Boiler / Furnace</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Pump / Compressor</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Heat Exchanger</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reactor / Tank</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Other Asset</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-400"></span> Document</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-600 rotate-45 transform origin-center"></span> Failure Event</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-600"></span> Work Order</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Inspection</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Alarm</span>
          </div>

          <div className="h-[580px] bg-slate-50 border border-borderMain rounded-2xl relative overflow-hidden shadow-sm">
            {loadingGraph && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center font-bold text-textSecondary text-xs">
                Rendering plant topology graph structure...
              </div>
            )}
            <div ref={containerRef} className="w-full h-full"></div>

            {/* In-Canvas Floating Node Info Popover (Near Clicked Node with Big Font Size) */}
            <AnimatePresence>
              {selectedNodeData && popoverPos && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    left: `${popoverPos.x}px`,
                    top: `${popoverPos.y}px`
                  }}
                  className="absolute z-30 w-80 sm:w-88 max-w-[calc(100%-30px)] bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-3xl p-4 font-yd-gothic text-slate-800 space-y-3 pointer-events-auto max-h-[calc(100%-30px)] overflow-y-auto"
                >
                  {/* Popover Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#062a24] tracking-tight leading-tight">
                        {selectedNodeData.label}
                      </h3>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block mt-1 font-mono">
                        {selectedNodeData.groupName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClosePopover()}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Close"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Diagnostics Section (if Asset) */}
                  {selectedNodeData.groupName === 'assets' && (
                    <div className="space-y-3 pt-1">
                      {neighborsLoading ? (
                        <div className="text-slate-400 italic text-xs animate-pulse">Loading live diagnostics...</div>
                      ) : selectedNodeNeighbors ? (
                        <div className="space-y-3">
                          {/* Diagnostic Status */}
                          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnostics:</span>
                            {selectedNodeNeighbors.active_alarms?.length > 0 ? (
                              <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-xs animate-pulse">
                                🚨 {selectedNodeNeighbors.active_alarms.length} ACTIVE ALARMS
                              </span>
                            ) : selectedNodeData.properties?.status === 'maintenance' ? (
                              <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-lg shadow-xs">
                                ⚙️ MAINTENANCE
                              </span>
                            ) : (
                              <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-xs">
                                ✓ HEALTHY
                              </span>
                            )}
                          </div>

                          {/* Active Alarms */}
                          {selectedNodeNeighbors.active_alarms?.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 space-y-2">
                              <span className="text-xs font-extrabold text-red-900 block">Active Alarm Events:</span>
                              {selectedNodeNeighbors.active_alarms.map(a => (
                                <div key={a.alarm_id} className="text-xs text-red-800 border-b border-red-200/60 pb-1.5 last:border-0 last:pb-0 font-medium">
                                  <div className="font-extrabold text-sm">{a.alarm_type}</div>
                                  <div className="text-[11px] opacity-80 font-mono mt-0.5">Priority: {a.alarm_priority} • Triggered: {new Date(a.triggered_at).toLocaleTimeString()}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Upstream Feeders */}
                          {selectedNodeNeighbors.upstream?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Upstream Feeders</span>
                              <div className="space-y-1">
                                {selectedNodeNeighbors.upstream.map(up => (
                                  <div key={up.uat} className="flex justify-between items-center p-2 bg-amber-50/70 hover:bg-amber-100/80 rounded-xl border border-amber-200/70 transition-colors">
                                    <button
                                      type="button"
                                      onClick={() => selectNodeInGraph(up.uat)}
                                      className="text-amber-900 font-extrabold text-xs sm:text-sm hover:underline text-left truncate cursor-pointer"
                                    >
                                      {up.equipment_tag}
                                    </button>
                                    <span className="text-xs font-bold text-amber-700/80">{up.equipment_type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Downstream Fed */}
                          {selectedNodeNeighbors.downstream?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Downstream Fed</span>
                              <div className="space-y-1">
                                {selectedNodeNeighbors.downstream.map(down => (
                                  <div key={down.uat} className="flex justify-between items-center p-2 bg-blue-50/70 hover:bg-blue-100/80 rounded-xl border border-blue-200/70 transition-colors">
                                    <button
                                      type="button"
                                      onClick={() => selectNodeInGraph(down.uat)}
                                      className="text-blue-900 font-extrabold text-xs sm:text-sm hover:underline text-left truncate cursor-pointer"
                                    >
                                      {down.equipment_tag}
                                    </button>
                                    <span className="text-xs font-bold text-blue-700/80">{down.equipment_type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Properties Table */}
                  {selectedNodeData.properties && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Properties</span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {Object.entries(selectedNodeData.properties).map(([k, v]) => {
                          if (!v || v === 'Unknown') return null;
                          return (
                            <div key={k} className="flex justify-between items-center border-b border-slate-100 pb-1 text-xs">
                              <span className="text-slate-500 font-semibold">{k.replace(/_/g, ' ').toUpperCase()}</span>
                              <span className="text-slate-900 font-extrabold font-mono text-xs sm:text-sm text-right break-all max-w-[160px]">{v}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar: Controls & Graph Scale */}
        <div className="bg-transparent space-y-5 h-fit text-xs text-slate-600 font-yd-gothic p-1">
          
          {/* Controls Form Stacked Vertically */}
          <div className="border-b border-slate-300/60 pb-5 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">
              GRAPH CONTROLS
            </span>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              {/* Option 1: Asset Keyword */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-yd-gothic">
                  ASSET KEYWORD:
                </label>
                <input 
                  type="text" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. R-101, Boiler..." 
                  className="w-full bg-white border border-slate-200 focus:border-emerald-700/40 transition-all rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none shadow-2xs"
                />
              </div>

              {/* Option 2: Search Depth */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-yd-gothic">
                  SEARCH DEPTH:
                </label>
                <select 
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-700/40 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none cursor-pointer shadow-2xs"
                >
                  <option value="1">1 Hop (Direct Neighbors)</option>
                  <option value="2">2 Hops (Detailed Context)</option>
                  <option value="full">Full Network (No Filter)</option>
                </select>
              </div>

              {/* Option 3: Fetch Network Graph Button */}
              <button 
                type="submit" 
                className="w-full py-2.5 px-4 bg-[#062a24] hover:bg-[#08362e] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center font-yd-gothic"
              >
                Fetch Network Graph
              </button>
              
              {/* Option 4: Fit View Button */}
              <button 
                type="button" 
                onClick={fitGraphView} 
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer text-center font-yd-gothic flex items-center justify-center gap-1.5"
              >
                <span>🔍</span>
                <span>Fit View</span>
              </button>

              {/* Options 5 & 6: Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showDocs} 
                    onChange={(e) => { setShowDocs(e.target.checked); if(rawTopologyRef.current) setTimeout(() => renderGraph(rawTopologyRef.current), 50); }} 
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-800/20"
                  />
                  <span>Show Document Nodes</span>
                </label>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showOps} 
                    onChange={(e) => { setShowOps(e.target.checked); if(rawTopologyRef.current) setTimeout(() => renderGraph(rawTopologyRef.current), 50); }} 
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-800/20"
                  />
                  <span>Show Operational Events</span>
                </label>
              </div>
            </form>
          </div>
          
          {/* Degree Centrality */}
          <div className="border-b border-slate-300/60 pb-4 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">Degree Centrality</span>
            <div className="text-slate-500 font-medium">Most Connected Entity:</div>
            <div className="font-black text-base text-[#062a24] font-yd-gothic">{metrics.centralNode}</div>
            <div className="text-[11px] text-slate-500 font-medium">
              Connections Count: <strong className="text-slate-800 font-extrabold">{metrics.centralCount}</strong>
            </div>
          </div>

          {/* Graph Scale */}
          <div className="pb-4 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-yd-gothic">Graph Scale</span>
            <div className="grid grid-cols-2 gap-y-1.5 font-medium text-slate-600">
              <div>Assets: <strong className="text-slate-900 font-extrabold">{metrics.assets}</strong></div>
              <div>Docs: <strong className="text-slate-900 font-extrabold">{metrics.docs}</strong></div>
              <div>Failures: <strong className="text-slate-900 font-extrabold">{metrics.failures}</strong></div>
              <div>Work Orders: <strong className="text-slate-900 font-extrabold">{metrics.workOrders}</strong></div>
              <div>Inspections: <strong className="text-slate-900 font-extrabold">{metrics.inspections}</strong></div>
              <div>Alarms: <strong className="text-slate-900 font-extrabold">{metrics.alarms}</strong></div>
            </div>
          </div>

        </div>
      </div>

      {/* CASCADE STRESS TESTER PANEL (Gridless, Minimal & Green Brand Palette) */}
      <div className="mt-10 bg-transparent pt-6 border-t border-slate-300/60 space-y-6 font-yd-gothic">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-[#062a24] tracking-tight">
            What-If Cascade Stress Tester
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-emerald-950/80 pt-1">
            Digital Twin Blast-Radius Simulator — Simulate cascade trip propagation when a plant asset fails.
          </p>
        </div>

        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-transparent py-1">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider block">
              Select Asset to Trip
            </label>
            <select
              value={selectedSimAsset}
              onChange={(e) => setSelectedSimAsset(e.target.value)}
              className="w-full bg-white border border-emerald-900/20 rounded-xl p-3 text-sm font-bold text-emerald-950 outline-none cursor-pointer shadow-2xs"
            >
              {simAssets.length === 0 && <option value="">Loading assets...</option>}
              {simAssets.map(a => (
                <option key={a.uat} value={a.uat}>
                  {a.equipment_tag} ({a.uat}) · Crit: {a.criticality_rating} · {a.status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider block">
              Trip Scenario
            </label>
            <input
              type="text"
              value={simScenario}
              onChange={(e) => setSimScenario(e.target.value)}
              placeholder="e.g. fouling_shutdown"
              className="w-full bg-white border border-emerald-900/20 rounded-xl p-3 text-sm font-bold text-emerald-950 outline-none shadow-2xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSimulating}
            className="w-full py-3 px-5 bg-[#062a24] hover:bg-[#0d3c34] disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all shadow-md cursor-pointer flex items-center justify-center uppercase tracking-wider"
          >
            {isSimulating ? 'Running simulation...' : 'Simulate Trip'}
          </button>
        </form>

        {simError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-bold">
            {simError}
          </div>
        )}

        {simResults && (
          <div className="space-y-6 pt-4 border-t border-slate-300/60">
            {/* Minimal Gridless Stats Row with Green Palette */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 py-2">
              <div className="border-l-3 border-emerald-700 pl-3.5 space-y-1">
                <span className="text-xs font-bold text-emerald-900/70 uppercase tracking-wider block">SOURCE ASSET</span>
                <span className="text-sm sm:text-base font-black text-[#062a24]">
                  {typeof simResults.simulation_summary?.source_asset === 'object'
                    ? `${simResults.simulation_summary.source_asset.equipment_tag} (${simResults.simulation_summary.source_asset.uat})`
                    : (simResults.simulation_summary?.source_asset || 'N/A')}
                </span>
              </div>
              <div className="border-l-3 border-emerald-700 pl-3.5 space-y-1">
                <span className="text-xs font-bold text-emerald-900/70 uppercase tracking-wider block">BLAST RADIUS</span>
                <span className="text-sm sm:text-base font-black text-[#062a24]">{simResults.simulation_summary?.total_affected_assets || 0} Assets Affected</span>
              </div>
              <div className="border-l-3 border-emerald-700 pl-3.5 space-y-1">
                <span className="text-xs font-bold text-emerald-900/70 uppercase tracking-wider block">MAX CASCADE DEPTH</span>
                <span className="text-sm sm:text-base font-black text-[#062a24]">{simResults.simulation_summary?.max_cascade_depth || 0} Hops</span>
              </div>
              <div className="border-l-3 border-emerald-700 pl-3.5 space-y-1">
                <span className="text-xs font-bold text-emerald-900/70 uppercase tracking-wider block">HOURLY EXPOSURE</span>
                <span className="text-sm sm:text-base font-black text-[#062a24]">
                  ${((simResults.financial_exposure?.hourly_cost_usd || simResults.financial_exposure?.estimated_downtime_cost_usd || 0)).toLocaleString()} USD/hr
                </span>
              </div>
            </div>

            {simResults.immediate_actions && simResults.immediate_actions.length > 0 && (
              <div className="border-l-3 border-emerald-800 pl-3.5 space-y-1.5 py-1">
                <span className="font-extrabold text-[#062a24] block uppercase tracking-wider text-xs">Immediate Containment Actions</span>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
                  {simResults.immediate_actions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            )}

            {simResults.blast_radius && simResults.blast_radius.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-black text-[#062a24] uppercase tracking-wider">Affected Downstream Components</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="text-emerald-900 font-extrabold uppercase text-xs border-b border-slate-300/60">
                      <tr>
                        <th className="py-2.5 px-2">Tag</th>
                        <th className="py-2.5 px-2">Propagation Step</th>
                        <th className="py-2.5 px-2">Flow / Relation</th>
                        <th className="py-2.5 px-2">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 font-bold text-emerald-950">
                      {simResults.blast_radius.map((b, i) => {
                        const riskLevel = b.risk_level || (b.criticality_rating >= 4 ? 'CRITICAL' : 'HIGH');
                        const propStep = b.propagation_step || `Hop ${b.depth} (${b.estimated_minutes_to_trip || 0} mins)`;
                        const flowRel = b.expected_failure_mode || `${b.via_flow_type || 'fluid'} (${b.relationship_type || 'DEPENDS_ON'})`;
                        return (
                          <tr key={i} className="hover:bg-slate-200/40 transition-colors">
                            <td className="py-3 px-2 font-black text-[#062a24]">{b.equipment_tag || b.uat}</td>
                            <td className="py-3 px-2">{propStep}</td>
                            <td className="py-3 px-2">{flowRel}</td>
                            <td className="py-3 px-2">
                              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                                {riskLevel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}