"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Network, Cpu, MessageSquare, Zap, 
  Shield, Server, CheckCircle2 
} from "lucide-react";

// Types for MCP Packets
interface McpPacket {
  id: number;
  from: string;
  to: string;
  type: "query" | "context" | "tool_call" | "response";
  label: string;
}

export default function McpArchitecturePage() {
  const [packets, setPackets] = useState<McpPacket[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulation Loop
  useEffect(() => {
    let packetId = 0;
    const interval = setInterval(() => {
      packetId++;
      const rand = Math.random();
      
      let newPacket: McpPacket;
      let logMsg = "";

      if (rand < 0.33) {
        // Scenario 1: Text Agent -> Fact Check (Tool Call)
        newPacket = { id: packetId, from: "text", to: "fact", type: "tool_call", label: "VerifyClaim()" };
        logMsg = "[MCP] TextAgent requested tool execution: FactCheckDB.search()";
      } else if (rand < 0.66) {
        // Scenario 2: Deepfake -> Network (Context Sharing)
        newPacket = { id: packetId, from: "deepfake", to: "network", type: "context", label: "SharedContext{Risk:High}" };
        logMsg = "[MCP] DeepfakeAgent shared context context_id_992 with NetworkGraph";
      } else {
        // Scenario 3: Fact Check -> Main (Response)
        newPacket = { id: packetId, from: "fact", to: "main", type: "response", label: "Result: False" };
        logMsg = "[MCP] FactCheckAgent returned payload via secure channel";
      }

      setPackets(prev => [...prev, newPacket]);
      setLogs(prev => [`${new Date().toLocaleTimeString()} ${logMsg}`, ...prev].slice(0, 8));

      // Remove packet after animation
      setTimeout(() => {
        setPackets(prev => prev.filter(p => p.id !== newPacket.id));
      }, 2000);

    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Fixed type definition here: icon is React.ElementType
  const AgentNode = ({ label, icon: Icon, color }: { id: string, label: string, icon: React.ElementType, color: string }) => (
    <div className={`relative flex flex-col items-center p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-lg w-32 md:w-40 z-10 ${color}`}>
      <div className="p-3 rounded-full bg-white/5 mb-2 relative">
        <Icon size={24} />
        <div className="absolute inset-0 rounded-full animate-pulse bg-current opacity-20"></div>
      </div>
      <span className="font-bold text-sm text-center">{label}</span>
      <Badge variant="outline" className="mt-2 text-[10px] bg-black/50 border-white/10">MCP Ready</Badge>
      
      {/* Connector Dots */}
      <div className="absolute -bottom-2 w-2 h-2 bg-white/50 rounded-full"></div>
      <div className="absolute -top-2 w-2 h-2 bg-white/50 rounded-full"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen space-y-8 bg-background">
      
      {/* Header */}
      {/* <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-cyan-500 mb-2">
          MCP: Model Context Protocol
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Visualizing real-time inter-agent communication. Our agents use MCP to share context, invoke tools, and prevent hallucinations by maintaining a shared state.
        </p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Visualization Area */}
        <div className="lg:col-span-2 relative h-[500px] bg-grid-white/[0.02] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center bg-black/20">
          
          {/* Central Hub */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-white/20 rounded-full flex items-center justify-center animate-spin-slow">
            <div className="w-32 h-32 bg-blue-500/10 rounded-full blur-xl absolute"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
            <Server className="text-blue-500 opacity-50" size={64} />
          </div>

          {/* Agents Placement */}
          <div className="absolute top-10 left-10">
            <AgentNode id="text" label="Text Analyzer" icon={MessageSquare} color="text-blue-400" />
          </div>
          <div className="absolute top-10 right-10">
            <AgentNode id="deepfake" label="Deepfake Guard" icon={Shield} color="text-red-400" />
          </div>
          <div className="absolute bottom-10 left-10">
            <AgentNode id="fact" label="Fact Checker" icon={CheckCircle2} color="text-green-400" />
          </div>
          <div className="absolute bottom-10 right-10">
            <AgentNode id="network" label="Network Graph" icon={Network} color="text-purple-400" />
          </div>

          {/* Moving Packets */}
          <AnimatePresence>
            {packets.map((packet) => (
              <motion.div
                key={packet.id}
                initial={getInitialPos(packet.from)}
                animate={getInitialPos(packet.to)}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute z-20 flex items-center gap-2 bg-white text-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              >
                <Zap size={12} className="fill-yellow-500 text-yellow-500" />
                <span className="text-[10px] font-bold font-mono">{packet.label}</span>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>

        {/* Info & Logs Panel */}
        <div className="space-y-6">
          <Card className="bg-background/40 backdrop-blur-xl border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="text-primary" /> Protocol Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-muted-foreground">Context Window</span>
                <span className="font-mono font-bold text-green-400">128k Tokens</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-muted-foreground">Agent Latency</span>
                <span className="font-mono font-bold text-blue-400">42ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-sm text-muted-foreground">Security Layer</span>
                <span className="font-mono font-bold text-yellow-400">TLS 1.3</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 border-border/20 flex-1 h-[250px] flex flex-col">
            <CardHeader className="py-3 border-b border-white/10">
              <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Live Protocol Stream</CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-hidden relative font-mono text-xs space-y-2 text-green-500/90">
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="truncate"
                  >
                    <span className="text-gray-500 mr-2">{">"}</span>
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper to position packets based on Agent IDs
function getInitialPos(id: string) {
  const positions: Record<string, { top: string, left: string }> = {
    text: { top: "15%", left: "15%" },
    deepfake: { top: "15%", left: "85%" },
    fact: { top: "85%", left: "15%" },
    network: { top: "85%", left: "85%" },
    main: { top: "50%", left: "50%" } // Central Hub
  };
  return positions[id] || positions.main;
}