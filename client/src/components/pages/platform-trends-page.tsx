"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  ExternalLink,
  Eye,
  MessageCircle,
  Network,
  Search,
  Share2,
  Shield,
  TrendingUp,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

import AiFactBot from "@/components/ai-fact-bot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTabStore } from "@/stores/tabStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// --- Types ---
interface NewsTrend {
  id: string;
  title: string;
  source: string;
  time: string;
  risk: "high" | "medium" | "low" | "critical";
  engagement: number;
}

const MOCK_NEWS_DB: NewsTrend[] = [
  { id: "1", title: "Election Commission announces new guidelines", source: "Official Press", time: "2h ago", risk: "low", engagement: 1540 },
  { id: "2", title: "Viral video claims voting machines malfunction", source: "Twitter / X", time: "45m ago", risk: "high", engagement: 45200 },
  { id: "3", title: "Deepfake: Candidate X appearing to endorse opponent", source: "CivicShield AI", time: "10m ago", risk: "critical", engagement: 1200 },
  { id: "4", title: "Voter turnout expected to reach record highs", source: "News Daily", time: "3h ago", risk: "low", engagement: 8900 },
  { id: "5", title: "Bot network spreading false polling dates", source: "Network Monitor", time: "15m ago", risk: "high", engagement: 23000 },
];

const PIE_DATA = [
  { name: "EVM Integrity", value: 400, color: "#ef4444" }, // Red
  { name: "Voter Fraud", value: 300, color: "#f97316" },   // Orange
  { name: "Political Ads", value: 300, color: "#3b82f6" }, // Blue
  { name: "Policy", value: 200, color: "#22c55e" },       // Green
];

// --- Mini Source Graph Component ---
const MiniSourceGraph = () => (
  <div className="relative h-40 w-full bg-black/20 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Central Node */}
      <div className="w-4 h-4 bg-red-500 rounded-full z-10 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse" />
      
      {/* Satellite Nodes */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: Math.cos(deg * Math.PI / 180) * 60,
            y: Math.sin(deg * Math.PI / 180) * 60
          }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        />
      ))}
      
      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.line
            key={i}
            x1="50%"
            y1="50%"
            x2={`${50 + Math.cos(deg * Math.PI / 180) * 20}%`}
            y2={`${50 + Math.sin(deg * Math.PI / 180) * 35}%`} // Approximate logic for visual
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        ))}
      </svg>
    </div>
    <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">Origin Analysis</span>
  </div>
);

export default function PlatformTrendsPage() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<NewsTrend[]>(MOCK_NEWS_DB);
  const [chartData, setChartData] = useState(PIE_DATA);
  const [selectedAlert, setSelectedAlert] = useState<NewsTrend | null>(null);
  
  // To redirect to Source Graph page
  const { setActiveTab } = useTabStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => prev.map(item => ({
        ...item,
        value: item.value + Math.floor(Math.random() * 20 - 5)
      })));

      if (Math.random() > 0.8) {
        const newArticle: NewsTrend = {
          id: Date.now().toString(),
          title: `ALERT: New narrative spike detected in Sector ${Math.floor(Math.random() * 5)}`,
          source: "AI Monitor",
          time: "Just now",
          risk: Math.random() > 0.5 ? "high" : "medium",
          engagement: Math.floor(Math.random() * 5000)
        };
        setArticles(prev => [newArticle, ...prev].slice(0, 10));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRedirectToGraph = () => {
    setActiveTab("source-graph");
  };

  return (
    <div className="p-2 space-y-6 min-h-screen">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-500">Platform Trends</h1>
          <p className="text-muted-foreground">Real-time narrative tracking across social graph.</p>
        </div> */}
        <div className="flex gap-2">
           <Input 
             placeholder="Search narratives..." 
             className="w-full md:w-64 bg-background/50 backdrop-blur-sm"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />
           <Button variant="outline"><Search size={18} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-background/40 backdrop-blur-xl border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-blue-500" /> Live Feed
              </CardTitle>
              <CardDescription>Streaming election signals from 12+ platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles.map((article, i) => (
                  <motion.div
                    layout
                    key={article.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedAlert(article)}
                    className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border/20 bg-background/30 hover:bg-background/50 transition-all hover:border-primary/20 hover:shadow-md cursor-pointer"
                  >
                    <div className={`shrink-0 mt-1 p-3 rounded-full h-fit w-fit ${
                      article.risk === "critical" ? "bg-red-500/20 text-red-500 animate-pulse" : 
                      article.risk === "high" ? "bg-orange-500/20 text-orange-500" : "bg-blue-500/20 text-blue-500"
                    }`}>
                      {article.risk === "critical" || article.risk === "high" ? <AlertCircle size={24} /> : <MessageCircle size={24} />}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">{article.title}</h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                          <Clock size={12} /> {article.time}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline" className="bg-background/50">{article.source}</Badge>
                        <span className="flex items-center gap-1"><Eye size={12} /> {article.engagement.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Share2 size={12} /> {(article.engagement * 0.4).toFixed(0)}</span>
                        
                        {article.risk === "critical" && <Badge variant="destructive">CRITICAL</Badge>}
                        {article.risk === "high" && <Badge className="bg-orange-500 hover:bg-orange-600">HIGH RISK</Badge>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Analytics */}
        <div className="space-y-6">
          <Card className="bg-background/40 backdrop-blur-xl border-border/40">
            <CardHeader>
              <CardTitle>Topic Distribution</CardTitle>
              <CardDescription>Current narrative dominance</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "none", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

            {/* AI Fact-Check Bot (simulated live) */}
            <div>
              <AiFactBot articles={articles} />
            </div>

            <div className="grid grid-cols-2 gap-4">
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">84%</div>
                <div className="text-xs text-blue-400/80">Sentiment Negative</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">12k</div>
                <div className="text-xs text-purple-400/80">Bot Accounts</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* --- ALERT DETAIL MODAL --- */}
      <Dialog open={!!selectedAlert} onOpenChange={(open: boolean) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-2xl border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-full ${
                selectedAlert?.risk === "critical" ? "bg-red-500/20" : "bg-blue-500/20"
              }`}>
                {selectedAlert?.risk === "critical" ? <AlertCircle className="text-red-500 w-5 h-5" /> : <TrendingUp className="text-blue-500 w-5 h-5" />}
              </div>
              <DialogTitle className="text-xl">Narrative Intelligence Report</DialogTitle>
            </div>
            <DialogDescription>
              Detailed forensic analysis of the selected timeline event.
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* Left Column: Metadata */}
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-background/50 border border-border/20">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Source Narrative</h4>
                  <p className="font-medium leading-relaxed">{selectedAlert.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg bg-background/50 border border-border/20">
                    <span className="text-xs text-muted-foreground">Detection Model</span>
                    <div className="flex items-center gap-1 font-mono text-sm mt-1 text-primary">
                      <Zap size={14} />
                      RoBERTa-L4
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50 border border-border/20">
                    <span className="text-xs text-muted-foreground">Origin Platform</span>
                    <div className="flex items-center gap-1 font-mono text-sm mt-1">
                      {selectedAlert.source}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Similar Patterns Detected</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-red-400">
                      <AlertCircle size={12} />
                      <span>Matching claim in Sector 4 (89% similarity)</span>
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp size={12} />
                      <span>Cross-posted to Telegram 5 mins ago</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Visualization */}
              <div className="space-y-4 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Propagation Graph</h4>
                    <Badge variant="outline" className="text-[10px]">Live View</Badge>
                  </div>
                  <MiniSourceGraph />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-yellow-500">AI Recommendation</h5>
                      <p className="text-xs text-yellow-200/80 mt-1">
                        High probability of coordinated bot activity. Recommend flagging origin node and restricting reach.
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleRedirectToGraph} className="w-full gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Network size={16} />
                  Trace Full Source Graph
                  <ExternalLink size={12} className="opacity-50" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}