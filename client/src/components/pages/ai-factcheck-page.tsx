"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Zap,
  Target,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FactCheckResult {
  id: string;
  query: string;
  verdict: "true" | "false" | "mixed" | "unverified";
  confidence: number;
  sources: string[];
  timestamp: string;
  reasoning: string;
}

export default function AiFactcheckPage() {
  const [query, setQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [history, setHistory] = useState<FactCheckResult[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);

  const handleFactCheck = async () => {
    if (!query.trim()) return;
    setIsChecking(true);

    try {
      const resp = await fetch("/api/factcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await resp.json();
      const r = data?.result;

      const newResult: FactCheckResult = {
        id: Date.now().toString(),
        query,
        verdict: r?.verdict ?? "unverified",
        confidence: Number(r?.confidence) || 0,
        sources: Array.isArray(r?.sources) ? r.sources : [],
        timestamp: new Date().toLocaleTimeString(),
        reasoning: r?.reasoning ?? "No explanation provided."
      };

      setHistory(prev => [newResult, ...prev]);
      setQuery("");
    } catch (err: any) {
      setHistory(prev => [
        {
          id: Date.now().toString(),
          query,
          verdict: "unverified",
          confidence: 0,
          sources: [],
          timestamp: new Date().toLocaleTimeString(),
          reasoning: `Request failed: ${err?.message ?? "Unknown error"}`
        },
        ...prev
      ]);
    } finally {
      setIsChecking(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "true":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "false":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "mixed":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Fact Check Query
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter a news claim or statement..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="min-h-[120px]"
            />
            <Button
              onClick={handleFactCheck}
              disabled={isChecking || !query.trim()}
              className="w-full"
            >
              {isChecking ? <Zap className="mr-2 animate-pulse" /> : <Send className="mr-2" />}
              Fact Check
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mt-6 space-y-4" ref={historyRef}>
          {history.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <div
                  className={`h-1 ${
                    r.verdict === "true"
                      ? "bg-green-500"
                      : r.verdict === "false"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                />
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">“{r.query}”</h3>
                    <Badge className="flex gap-1">
                      {getVerdictIcon(r.verdict)}
                      {r.verdict.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm mb-3">
                    <strong>Reasoning:</strong> {r.reasoning}
                  </p>

                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" /> {r.confidence}%
                    </span>
                    <span>{r.timestamp}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Indexed Claims</span>
            <span className="font-mono">142,892</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Latency</span>
            <span className="font-mono">~120ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
