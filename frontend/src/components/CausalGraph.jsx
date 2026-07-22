import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { apiFetch } from '../utils';
import { Maximize, Loader2, AlertCircle } from 'lucide-react';

export default function CausalGraph({ searchQuery = '', filterType = '', onNodeSelect }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);

  // Zoom behavior ref to call programmatically
  const zoomBehavior = useRef(null);
  const zoomSelection = useRef(null);

  // Keep references to node and link selections for filtering
  const nodeSelection = useRef(null);
  const linkSelection = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await apiFetch('graph/topology');
        setGraphData(data);
      } catch (err) {
        setError(err.message || 'Failed to load graph data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 800;
    
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehavior.current = zoom;
    zoomSelection.current = svg;
    svg.call(zoom);

    // Deep copy data for D3 mutation
    const nodes = graphData.nodes.map(d => ({...d}));
    const links = graphData.edges.map(d => ({...d, source: d.from, target: d.to}));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-180))
      .force('collide', d3.forceCollide().radius(35))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Arrow markers
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#b1b7ab');

    const linkGroup = g.append('g').attr('class', 'links');
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const link = linkGroup.selectAll('.link-path')
      .data(links)
      .enter().append('g')
      .attr('class', 'link-path');

    const linkPath = link.append('path')
      .attr('stroke', '#b1b7ab')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#end)');

    const linkLabel = link.append('text')
      .attr('class', 'link-label')
      .attr('font-size', '10px')
      .attr('fill', '#276152')
      .attr('dy', -4)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .text(d => d.label || 'DEPENDS_ON');

    const node = nodeGroup.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    node.each(function(d) {
      const el = d3.select(this);
      const isFailure = d.group === 'Failure' || d.group === 'Incident';
      
      if (isFailure) {
        el.append('path')
          .attr('d', 'M0,-20 L20,0 L0,20 L-20,0 Z')
          .attr('fill', '#0d3a35')
          .attr('stroke', '#276152')
          .attr('stroke-width', 2);
      } else {
        el.append('circle')
          .attr('r', 18)
          .attr('fill', '#0d3a35')
          .attr('stroke', '#276152')
          .attr('stroke-width', 2);
      }

      el.append('text')
        .attr('dy', 30)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--c-text)')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(d.label);
    });

    node.on('mouseover', function(event, d) {
      const connectedNodeIds = new Set();
      connectedNodeIds.add(d.id);

      linkPath.attr('stroke-opacity', l => {
        if (l.source.id === d.id || l.target.id === d.id) {
          connectedNodeIds.add(l.source.id);
          connectedNodeIds.add(l.target.id);
          return 1;
        }
        return 0.05;
      });

      linkLabel.attr('opacity', l => {
        return (l.source.id === d.id || l.target.id === d.id) ? 1 : 0;
      });

      node.attr('opacity', n => {
        return connectedNodeIds.has(n.id) ? 1 : 0.15;
      });
    })
    .on('mouseout', function() {
      // Re-apply filters on mouseout
      applyFilters();
    })
    .on('click', function(event, d) {
      if (onNodeSelect) {
        // Build mock details if not provided by backend
        const detailNode = {
          ...d,
          assetId: d.assetId || d.id,
          health: d.group === 'Failure' ? 'Critical' : 'Healthy',
          connected: Math.floor(Math.random() * 10) + 1,
          docs: Math.floor(Math.random() * 5),
          deps: Math.floor(Math.random() * 5),
          lastMaint: 'Recent',
          nextMaint: 'Upcoming'
        };
        onNodeSelect(detailNode);
      }
    });

    // Save selections for filtering
    nodeSelection.current = node;
    linkSelection.current = { linkPath, linkLabel };

    simulation.on('tick', () => {
      linkPath.attr('d', d => {
        return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
      });
      
      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2)
        .attr('transform', d => {
          const angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x) * 180 / Math.PI;
          return `rotate(${angle > 90 || angle < -90 ? angle + 180 : angle}, ${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`;
        });

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    setTimeout(() => {
      fitView();
    }, 500);

    return () => simulation.stop();
  }, [graphData]);

  // Apply Search and Filter
  const applyFilters = () => {
    if (!nodeSelection.current || !linkSelection.current) return;
    
    const { linkPath, linkLabel } = linkSelection.current;
    const query = searchQuery.toLowerCase();

    nodeSelection.current.attr('opacity', d => {
      const matchesSearch = !query || (d.label && d.label.toLowerCase().includes(query)) || (d.id && d.id.toLowerCase().includes(query));
      const matchesFilter = !filterType || (d.group && d.group.toLowerCase() === filterType.toLowerCase());
      return matchesSearch && matchesFilter ? 1 : 0.15;
    });

    linkPath.attr('stroke-opacity', 0.6);
    linkLabel.attr('opacity', 0);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterType]);

  const fitView = () => {
    if (!svgRef.current || !graphData || graphData.nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select('g');
    
    const bounds = g.node().getBBox();
    const parent = svg.node().parentElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight || 800;
    
    const width = bounds.width;
    const height = bounds.height;
    
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;
    
    if (width === 0 || height === 0) return;

    const scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
    const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

    if (zoomBehavior.current && zoomSelection.current) {
      zoomSelection.current.transition()
        .duration(750)
        .call(zoomBehavior.current.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }
  };

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col bg-transparent relative overflow-hidden" ref={containerRef}>
      
      {/* Header toolbar */}
      <div className="absolute top-0 right-0 p-4 flex justify-between items-center z-10">
        <button 
          onClick={fitView}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur text-[var(--c-secondary)] border border-[var(--c-border)] rounded-full font-semibold text-sm shadow-sm hover:bg-[var(--c-secondary)] hover:text-white transition-colors"
        >
          <Maximize size={16} /> Fit View
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <Loader2 className="w-8 h-8 text-[var(--c-secondary)] animate-spin mb-4" />
          <p className="text-[var(--c-text-secondary)] font-semibold">Analyzing topology from backend...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20">
          <AlertCircle className="w-12 h-12 text-[var(--c-danger)] mb-4" />
          <p className="text-[var(--c-danger)] font-bold text-lg">{error}</p>
        </div>
      )}

      <svg ref={svgRef} className="w-full h-full block" />
    </div>
  );
}
