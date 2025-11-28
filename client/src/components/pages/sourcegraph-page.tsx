/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Filter, Download, X, ExternalLink, Users, Share2, Eye, Calendar, Globe } from 'lucide-react';
import * as d3 from 'd3';

// Type definitions
interface GraphNode {
  id: string;
  name: string;
  type: string;
  platform: string;
  url: string;
  title: string;
  reads: number;
  shares: number;
  timestamp: string;
  credibility: number;
  description: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const SourceGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Hardcoded graph data
  const graphData: GraphData = {
    nodes: [
      {
        id: "origin",
        name: "Original Source",
        type: "origin",
        platform: "news",
        url: "https://fakenews.com/evm-hacked-bihar",
        title: "EVMs Hacked in Bihar Elections - Breaking News",
        reads: 1250000,
        shares: 89000,
        timestamp: "2025-01-15 08:30:00",
        credibility: 15,
        description: "Original fake news article claiming EVMs were hacked"
      },
      {
        id: "twitter-1",
        name: "Political Influencer",
        type: "social",
        platform: "twitter",
        url: "https://twitter.com/politicaluser/status/123456",
        title: "BREAKING: EVMs hacked in Bihar! Democracy under attack! #Election2024",
        reads: 2500000,
        shares: 150000,
        timestamp: "2025-01-15 09:15:00",
        credibility: 25,
        description: "High-follower account amplifying the misinformation"
      },
      {
        id: "facebook-1",
        name: "Community Group",
        type: "social",
        platform: "facebook",
        url: "https://facebook.com/groups/election-watch",
        title: "Evidence of EVM tampering in Bihar - Must watch video",
        reads: 890000,
        shares: 45000,
        timestamp: "2025-01-15 10:22:00",
        credibility: 20,
        description: "Facebook group sharing manipulated video as evidence"
      },
      {
        id: "whatsapp-1",
        name: "WhatsApp Forward",
        type: "messaging",
        platform: "whatsapp",
        url: "WhatsApp Group: Bihar Election Updates",
        title: "Viral video showing EVM hacking in real time",
        reads: 3500000,
        shares: 280000,
        timestamp: "2025-01-15 11:45:00",
        credibility: 10,
        description: "Widely forwarded message with deepfake video"
      },
      {
        id: "youtube-1",
        name: "Anonymous Channel",
        type: "video",
        platform: "youtube",
        url: "https://youtube.com/watch?v=fake123",
        title: "PROOF: How EVMs Were Hacked in Bihar (SHOCKING FOOTAGE)",
        reads: 1800000,
        shares: 95000,
        timestamp: "2025-01-15 12:30:00",
        credibility: 18,
        description: "YouTube video with edited footage presented as evidence"
      },
      {
        id: "telegram-1",
        name: "News Channel Clone",
        type: "messaging",
        platform: "telegram",
        url: "t.me/fakenewschannel",
        title: "Election Commission hiding EVM hacking truth",
        reads: 650000,
        shares: 38000,
        timestamp: "2025-01-15 13:20:00",
        credibility: 12,
        description: "Telegram channel mimicking legitimate news"
      },
      {
        id: "twitter-2",
        name: "Bot Network",
        type: "bot",
        platform: "twitter",
        url: "Multiple bot accounts",
        title: "Automated amplification of EVM hacking claims",
        reads: 5200000,
        shares: 420000,
        timestamp: "2025-01-15 14:00:00",
        credibility: 5,
        description: "Coordinated bot network spreading misinformation"
      },
      {
        id: "reddit-1",
        name: "Anonymous User",
        type: "social",
        platform: "reddit",
        url: "https://reddit.com/r/conspiracy/evm-hack",
        title: "Why mainstream media is silent about Bihar EVM hacking",
        reads: 420000,
        shares: 12000,
        timestamp: "2025-01-15 15:30:00",
        credibility: 22,
        description: "Reddit post creating conspiracy narrative"
      }
    ],
    links: [
      { source: "origin", target: "twitter-1" },
      { source: "origin", target: "facebook-1" },
      { source: "twitter-1", target: "whatsapp-1" },
      { source: "facebook-1", target: "youtube-1" },
      { source: "twitter-1", target: "telegram-1" },
      { source: "whatsapp-1", target: "twitter-2" },
      { source: "youtube-1", target: "reddit-1" },
      { source: "telegram-1", target: "twitter-2" }
    ]
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'origin': return '#ef4444';
      case 'social': return '#3b82f6';
      case 'messaging': return '#10b981';
      case 'video': return '#f59e0b';
      case 'bot': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return '𝕏';
      case 'facebook': return 'F';
      case 'youtube': return '▶';
      case 'whatsapp': return '📱';
      case 'telegram': return '✈';
      case 'reddit': return 'R';
      case 'news': return '📰';
      default: return '🌐';
    }
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    
    svg.attr("width", width).attr("height", height);

    // Create a copy of nodes with required simulation properties
    const nodes: (GraphNode & d3.SimulationNodeDatum)[] = graphData.nodes.map(d => ({ ...d }));
    const links: (GraphLink & d3.SimulationLinkDatum<GraphNode & d3.SimulationNodeDatum>)[] = graphData.links.map(d => ({ ...d }));

    // Create a container group for zoom and pan
    const container = svg.append("g");

    // Define zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    // Apply zoom to SVG (with type assertion to handle D3 selection typing)
    (svg as any).call(zoom);

    // Define drag behavior for nodes
    const drag = d3.drag<SVGCircleElement, GraphNode & d3.SimulationNodeDatum>()
      .on("start", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));

    // Add links to container
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#464b53")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.8);

    // Add nodes to container
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", (d: GraphNode) => Math.max(20, Math.min(40, d.reads / 100000)))
      .attr("fill", (d: GraphNode) => getNodeColor(d.type))
      .attr("stroke", "#17191c")
      .attr("stroke-width", 2)
      .style("cursor", "grab")
      .call(drag)
      .on("click", (event: any, d: GraphNode) => {
        // Prevent zoom when clicking on nodes
        event.stopPropagation();
        setSelectedNode(d);
        setShowModal(true);
      })
      .on("mousedown", function() {
        d3.select(this).style("cursor", "grabbing");
      })
      .on("mouseup", function() {
        d3.select(this).style("cursor", "grab");
      });

    // Add node labels to container
    const label = container.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text((d: GraphNode) => getPlatformIcon(d.platform))
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Add node titles to container
    const title = container.append("g")
      .attr("class", "titles")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text((d: GraphNode) => d.name)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("dy", "45px")
      .attr("fill", "white")
      .style("pointer-events", "none")
      .style("user-select", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as any).x)
        .attr("y1", (d: any) => (d.source as any).y)
        .attr("x2", (d: any) => (d.target as any).x)
        .attr("y2", (d: any) => (d.target as any).y);

      node
        .attr("cx", (d: any) => d.x || 0)
        .attr("cy", (d: any) => d.y || 0);

      label
        .attr("x", (d: any) => d.x || 0)
        .attr("y", (d: any) => d.y || 0);

      title
        .attr("x", (d: any) => d.x || 0)
        .attr("y", (d: any) => d.y || 0);
    });

    // Add zoom controls
    const zoomControls = svg.append("g")
      .attr("class", "zoom-controls")
      .attr("transform", "translate(10, 10)");

    // Zoom in button
    const zoomInButton = zoomControls.append("g")
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(300).call(
          zoom.scaleBy as any, 1.5
        );
      });

    zoomInButton.append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#2e3238")
      .attr("stroke", "#464b53")
      .attr("rx", 4);

    zoomInButton.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("+");

    // Zoom out button
    const zoomOutButton = zoomControls.append("g")
      .attr("transform", "translate(0, 35)")
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(300).call(
          zoom.scaleBy as any, 0.75
        );
      });

    zoomOutButton.append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#2e3238")
      .attr("stroke", "#464b53")
      .attr("rx", 4);

    zoomOutButton.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("−");

    // Reset zoom button
    const resetButton = zoomControls.append("g")
      .attr("transform", "translate(0, 70)")
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(500).call(
          zoom.transform as any,
          d3.zoomIdentity
        );
      });

    resetButton.append("rect")
      .attr("width", 30)
      .attr("height", 30)
      .attr("fill", "#2e3238")
      .attr("stroke", "#464b53")
      .attr("rx", 4);

    resetButton.append("text")
      .attr("x", 15)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("⌂");

  }, [graphData.nodes, graphData.links]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#17191c] text-white">
      {/* Header */}
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-white mb-1">Source Graph</h1>
            <p className="text-gray-400 text-base">Network analysis of misinformation spread and source credibility</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2e3238] hover:bg-[#464b53] rounded-lg text-sm text-white border border-[#464b53] transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2e3238] hover:bg-[#464b53] rounded-lg text-sm text-white border border-[#464b53] transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2e3238] hover:bg-[#464b53] rounded-lg text-sm text-white border border-[#464b53] transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Graph Visualization */}
          <div className="xl:col-span-3">
            <div className="bg-[#2e3238] rounded-lg border border-[#464b53] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-white">Misinformation Network Visualization</h2>
              </div>
              <p className="text-sm text-gray-400 mb-2">Interactive network showing how misinformation spreads across platforms</p>
              <p className="text-xs text-gray-500 mb-4">
                💡 <strong>Interactions:</strong> Drag nodes to reposition • Scroll to zoom • Drag background to pan • Click nodes for details • Use zoom controls (top-left)
              </p>
              
              <div className="bg-[#17191c] rounded-lg border border-[#464b53] p-4">
                <svg ref={svgRef} className="w-full"></svg>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-400">Origin Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-400">Social Media</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-400">Messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-400">Video Platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-400">Bot Network</span>
                </div>
              </div>
            </div>
          </div>

          {/* Network Stats */}
          <div className="xl:col-span-1">
            <div className="bg-[#2e3238] rounded-lg border border-[#464b53] p-5 mb-5">
              <h2 className="text-lg font-medium text-white mb-3">Network Stats</h2>
              <p className="text-sm text-gray-400 mb-4">Real-time spread analytics</p>
              
              <div className="space-y-3">
                <div className="p-3 bg-[#17191c] rounded border border-[#464b53]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">Total Reach</span>
                    <span className="text-xl font-semibold text-white">15.2M</span>
                  </div>
                  <div className="text-xs text-red-400">+45% in 6hrs</div>
                </div>

                <div className="p-3 bg-[#17191c] rounded border border-[#464b53]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">Active Nodes</span>
                    <span className="text-xl font-semibold text-white">8</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="text-xs text-red-400">Critical</div>
                    <div className="text-xs text-red-400 ml-auto">+2 new</div>
                  </div>
                </div>

                <div className="p-3 bg-[#17191c] rounded border border-[#464b53]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">Shares</span>
                    <span className="text-xl font-semibold text-white">1.1M</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="text-xs text-yellow-400">High</div>
                    <div className="text-xs text-yellow-400 ml-auto">+38% spread</div>
                  </div>
                </div>

                <div className="p-3 bg-[#17191c] rounded border border-[#464b53]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">Avg Credibility</span>
                    <span className="text-xl font-semibold text-white">16%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="text-xs text-red-400">Very Low</div>
                    <div className="text-xs text-red-400 ml-auto">-5% score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="bg-[#2e3238] rounded-lg border border-[#464b53] p-5">
              <h2 className="text-lg font-medium text-white mb-3">Platform Breakdown</h2>
              <p className="text-sm text-gray-400 mb-4">Distribution across platforms</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-[#17191c] rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">𝕏</span>
                    <span className="text-sm text-white">Twitter</span>
                  </div>
                  <span className="text-sm text-white">7.7M</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#17191c] rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📱</span>
                    <span className="text-sm text-white">WhatsApp</span>
                  </div>
                  <span className="text-sm text-white">3.5M</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#17191c] rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">▶</span>
                    <span className="text-sm text-white">YouTube</span>
                  </div>
                  <span className="text-sm text-white">1.8M</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#17191c] rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">F</span>
                    <span className="text-sm text-white">Facebook</span>
                  </div>
                  <span className="text-sm text-white">890K</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#17191c] rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✈</span>
                    <span className="text-sm text-white">Telegram</span>
                  </div>
                  <span className="text-sm text-white">650K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2e3238] rounded-lg border border-[#464b53] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[#464b53]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium text-white">Source Details</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-[#464b53] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                >
                  {getPlatformIcon(selectedNode.platform)}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">{selectedNode.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{selectedNode.platform} • {selectedNode.type}</p>
                </div>
              </div>

              <div className="bg-[#17191c] rounded-lg border border-[#464b53] p-4 mb-4">
                <h5 className="text-sm font-medium text-white mb-2">Content Title</h5>
                <p className="text-sm text-gray-300 mb-3">{selectedNode.title}</p>
                <p className="text-xs text-gray-400">{selectedNode.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#17191c] rounded-lg border border-[#464b53] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Total Reach</span>
                  </div>
                  <span className="text-lg font-semibold text-white">{formatNumber(selectedNode.reads)}</span>
                </div>
                <div className="bg-[#17191c] rounded-lg border border-[#464b53] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">Shares</span>
                  </div>
                  <span className="text-lg font-semibold text-white">{formatNumber(selectedNode.shares)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#17191c] rounded-lg border border-[#464b53] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-400">Credibility Score</span>
                  </div>
                  <span className="text-lg font-semibold text-red-400">{selectedNode.credibility}%</span>
                </div>
                <div className="bg-[#17191c] rounded-lg border border-[#464b53] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Published</span>
                  </div>
                  <span className="text-sm text-white">{selectedNode.timestamp}</span>
                </div>
              </div>

              <div className="bg-[#17191c] rounded-lg border border-[#464b53] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Source URL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-300 truncate mr-2">{selectedNode.url}</span>
                  <button className="flex items-center gap-1 px-3 py-1 bg-[#2e3238] hover:bg-[#464b53] rounded text-xs text-white transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceGraph;