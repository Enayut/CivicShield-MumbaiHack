"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type NewsTrend = {
  id: string;
  title: string;
  source: string;
  time: string;
  risk?: string;
  engagement?: number;
};

type CheckResult = {
  id: string;
  inputTitle: string;
  source: string;
  timeReceived: string;
  verdict: string;
  confidence: number;
  processedAt: string;
};

export default function AiFactBot({ articles }: { articles: NewsTrend[] }) {
  const [connected, setConnected] = useState(true);
  const [processing, setProcessing] = useState<CheckResult | null>(null);
  const [history, setHistory] = useState<CheckResult[]>([]);

  const seenRef = useRef<Record<string, boolean>>({});
  const queueRef = useRef<NewsTrend[]>([]);

  useEffect(() => {
    // Simulate intermittent connection status
    const connInterval = setInterval(() => {
      // keep mostly connected, sometimes flicker
      setConnected(prev => Math.random() > 0.06 ? prev : !prev);
    }, 5000);
    return () => clearInterval(connInterval);
  }, []);

  // Detect new articles and enqueue them for processing
  useEffect(() => {
    if (!articles || articles.length === 0) return;
    articles.forEach(a => {
      if (!seenRef.current[a.id]) {
        seenRef.current[a.id] = true;
        queueRef.current.push(a);
      }
    });
  }, [articles]);

  // Worker to process queue items sequentially
  useEffect(() => {
    let mounted = true;

    const processNext = async () => {
      if (!mounted) return;
      if (!connected) {
        // pause then retry
        setTimeout(processNext, 1500 + Math.random() * 2000);
        return;
      }

      const next = queueRef.current.shift();
      if (!next) {
        setTimeout(processNext, 800);
        return;
      }

      // simulate processing delay
      setProcessing(null);
      setTimeout(() => {
        if (!mounted) return;
        // crude heuristics for verdict
        const txt = next.title.toLowerCase();
        let verdict = "Unverified";
        if (txt.includes("deepfake") || txt.includes("fake")) verdict = "Likely False";
        else if (txt.includes("election commission") || txt.includes("official")) verdict = "Likely True";
        else if (txt.includes("alert") || txt.includes("viral")) verdict = "Unverified";

        const confidence = Math.round(50 + Math.random() * 45);
        const result: CheckResult = {
          id: Date.now().toString() + Math.random().toString(36).slice(2,6),
          inputTitle: next.title,
          source: next.source,
          timeReceived: new Date().toLocaleTimeString(),
          verdict,
          confidence,
          processedAt: new Date().toLocaleTimeString(),
        };

        setProcessing(result);
        setHistory(prev => [result, ...prev].slice(0, 30));

        // small delay to show processing state then continue
        setTimeout(() => processNext(), 800 + Math.random() * 900);
      }, 800 + Math.random() * 1200);
    };

    // start worker
    processNext();

    return () => { mounted = false; };
  }, [connected]);

  return (
    <Card className="bg-background/30 border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm">AI Fact-Check Bot</CardTitle>
            <Badge variant="outline" className="text-[11px]">Simulated Live</Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`inline-flex items-center gap-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <CardDescription className="text-[12px]">Processing incoming signals and appending results to history in real time.</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <div className="mb-3">
          <div className="text-[11px] text-muted-foreground mb-2">Live Processing</div>
          <div className="p-2 border rounded-md bg-background/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400/40" />
              <div className="flex flex-col">
                <div className="text-sm font-medium">{processing ? processing.inputTitle : 'Idle — waiting for new items'}</div>
                <div className="text-[11px] text-muted-foreground">{processing ? `${processing.source} • processed ${processing.processedAt}` : 'No current job'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {processing ? (
                <div className="text-right">
                  <div className="text-sm font-semibold">{processing.verdict}</div>
                  <div className="text-[11px] text-muted-foreground">Confidence: {processing.confidence}%</div>
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1"><RefreshCw size={14} className="animate-spin-slow" /> idle</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] text-muted-foreground mb-2">History</div>
          <div className="max-h-48 overflow-y-auto space-y-2 p-1">
            {history.length === 0 && (
              <div className="text-[12px] text-muted-foreground">No results yet — the bot will append as new feed items arrive.</div>
            )}
            {history.map(h => (
              <motion.div key={h.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-2 rounded-md border border-border/20 bg-background/10 flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{h.inputTitle}</div>
                  <div className="text-[11px] text-muted-foreground">{h.source} • {h.timeReceived}</div>
                </div>
                <div className="ml-3 text-right">
                  <div className={`text-sm font-semibold ${h.verdict.includes('True') ? 'text-green-400' : h.verdict.includes('False') ? 'text-red-400' : 'text-yellow-300'}`}>
                    {h.verdict}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{h.confidence}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
