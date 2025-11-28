"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Activity,
  MessageSquare,
  Zap,
  Brain,
  Search,
  Database,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface FactCheckResult {
  id: string;
  query: string;
  verdict: 'true' | 'false' | 'mixed' | 'unverified';
  confidence: number;
  sources: string[];
  timestamp: string;
  reasoning: string;
}

const mockFactCheckHistory: FactCheckResult[] = [
  {
    id: '1',
    query: 'COVID-19 vaccines contain microchips',
    verdict: 'false',
    confidence: 98,
    sources: ['WHO', 'CDC', 'Reuters'],
    timestamp: '2 min ago',
    reasoning: 'No credible evidence supports this claim. Multiple health organizations have confirmed vaccine ingredients.'
  },
  {
    id: '2',
    query: 'Climate change is a natural phenomenon',
    verdict: 'mixed',
    confidence: 75,
    sources: ['NASA', 'IPCC', 'Nature'],
    timestamp: '15 min ago',
    reasoning: 'While climate has natural variations, current warming is primarily human-caused according to scientific consensus.'
  },
  {
    id: '3',
    query: 'New tax law reduces income tax by 15%',
    verdict: 'true',
    confidence: 92,
    sources: ['IRS', 'Congressional Record', 'Tax Foundation'],
    timestamp: '1 hour ago',
    reasoning: 'The recently passed legislation does include a 15% reduction in income tax rates for certain brackets.'
  },
  {
    id: '4',
    query: 'Drinking water from plastic bottles causes cancer',
    verdict: 'unverified',
    confidence: 45,
    sources: ['FDA', 'Harvard Health', 'WebMD'],
    timestamp: '2 hours ago',
    reasoning: 'Studies show mixed results. Some chemicals may pose risks, but conclusive evidence is still being researched.'
  }
];

export function AiFactcheckPage() {
  const [query, setQuery] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [history, setHistory] = useState<FactCheckResult[]>(mockFactCheckHistory);

  const handleFactCheck = async () => {
    if (!query.trim()) return;
    
    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      const newResult: FactCheckResult = {
        id: Date.now().toString(),
        query,
        verdict: Math.random() > 0.5 ? 'true' : 'false',
        confidence: Math.floor(Math.random() * 40) + 60,
        sources: ['AI Analysis', 'Cross-referenced Sources', 'Real-time Data'],
        timestamp: 'Just now',
        reasoning: 'AI analysis based on cross-referencing multiple verified sources and real-time data validation.'
      };
      
      setHistory([newResult, ...history]);
      setQuery('');
      setIsChecking(false);
    }, 2000);
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'true': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'false': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'mixed': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'unverified': return <Clock className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-100 to-background-50 dark:from-background-900 dark:to-background-800">
      {/* Header */}
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-900 dark:text-text-100 mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            AI Fact Checker
          </h1>
          <p className="text-text-600 dark:text-text-400">
            Real-time fact verification powered by advanced AI and cross-referenced sources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Powered</span>
          </motion.div>
        </div>
      </motion.div> */}

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: "Checks Today", value: "1,247", change: "+15%", icon: Bot, color: "blue" },
          { title: "Accuracy Rate", value: "94.3%", change: "+2%", icon: Target, color: "green" },
          { title: "Sources Verified", value: "8,920", change: "+8%", icon: Database, color: "purple" },
          { title: "Response Time", value: "1.2s", change: "-12%", icon: Zap, color: "orange" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-lg border-r-white border-b-white hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-600 dark:text-text-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-text-900 dark:text-text-100">
                        {stat.value}
                      </p>
                      <p className={`text-sm font-medium ${
                        stat.color === 'blue' ? 'text-blue-600' : 
                        stat.color === 'green' ? 'text-green-600' : 
                        stat.color === 'purple' ? 'text-purple-600' : 
                        'text-orange-600'
                      }`}>
                        {stat.change} from yesterday
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' : 
                      stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' : 
                      stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' : 
                      'bg-orange-100 dark:bg-orange-900/20'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        stat.color === 'blue' ? 'text-blue-600' : 
                        stat.color === 'green' ? 'text-green-600' : 
                        stat.color === 'purple' ? 'text-purple-600' : 
                        'text-orange-600'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Fact Check Interface */}
        <div className="lg:col-span-2">
          {/* Fact Check Input */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                    <Search className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-text-800 text-2xl dark:text-text-200">Fact Check Query</CardTitle>
                    <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                      Enter a claim or statement to verify its accuracy
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter the claim or statement you want to fact-check..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[100px] bg-background/40 border-border/20"
                />
                <Button 
                  onClick={handleFactCheck}
                  disabled={!query.trim() || isChecking}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isChecking ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Bot className="w-4 h-4" />
                      </motion.div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Fact Check
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Analysis Dashboard */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-900/20">
                    <Brain className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-text-800 dark:text-text-200">AI Analysis Pipeline</CardTitle>
                    <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                      Real-time processing and verification workflow
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { step: "Source Analysis", status: "Complete", count: "247 sources", icon: Database, color: "green" },
                    { step: "Cross-Reference", status: "Processing", count: "18 matches", icon: Activity, color: "blue" },
                    { step: "Confidence Score", status: "Ready", count: "94.3% avg", icon: Target, color: "purple" }
                  ].map((item) => (
                    <div key={item.step} className="bg-background/40 rounded-lg p-4 border border-border/10">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className={`w-4 h-4 ${
                          item.color === 'green' ? 'text-green-500' : 
                          item.color === 'blue' ? 'text-blue-500' : 
                          'text-purple-500'
                        }`} />
                        <span className="text-sm font-medium text-text-700 dark:text-text-300">
                          {item.step}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-lg font-bold text-text-900 dark:text-text-100">
                          {item.count}
                        </span>
                        <Badge 
                          variant={item.color === 'green' ? 'success' : 'secondary'} 
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Results and History */}
        <div>
          {/* Recent Fact Checks */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-text-800 dark:text-text-200 flex items-center gap-2 text-2xl">
                  <MessageSquare className="w-7 h-7 text-primary-500" />
                  Recent Fact Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((result) => (
                    <motion.div 
                      key={result.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-3 bg-background/30 hover:bg-background/50 transition-colors border border-border/10 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-text-700 dark:text-text-300 font-medium leading-relaxed flex-1 pr-2">
                          {result.query}
                        </p>
                        <div className="flex items-center gap-1 ml-2">
                          {getVerdictIcon(result.verdict)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={result.verdict === 'true' ? 'success' : 
                                   result.verdict === 'false' ? 'destructive' : 
                                   result.verdict === 'mixed' ? 'warning' : 'secondary'}
                            className="text-xs"
                          >
                            {result.verdict.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-text-500 dark:text-text-400">
                            {result.confidence}% confidence
                          </span>
                        </div>
                        <span className="text-xs text-text-500 dark:text-text-400">
                          {result.timestamp}
                        </span>
                      </div>
                      {result.reasoning && (
                        <p className="text-xs text-text-600 dark:text-text-400 mt-2 italic">
                          {result.reasoning}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Performance Metrics */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="rounded-none bg-blue-500/5 backdrop-blur-lg shadow-xl border border-blue-500/20 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <motion.span 
                    className="w-3 h-3 rounded-full bg-blue-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  AI Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { metric: "Model Accuracy", value: "94.3%", trend: "+2.1%", icon: Target },
                    { metric: "Processing Speed", value: "1.2s", trend: "-15%", icon: Zap },
                    { metric: "Source Coverage", value: "247", trend: "+8%", icon: Database },
                    { metric: "Daily Queries", value: "12.4K", trend: "+25%", icon: TrendingUp }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.6 }}
                      className="flex items-center justify-between p-3 bg-background/20 hover:bg-background/30 transition-colors border border-border/10 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-text-700 dark:text-text-300 font-medium">
                            {item.metric}
                          </p>
                          <p className="text-xs text-text-500 dark:text-text-400">
                            {item.trend} this week
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AiFactcheckPage;
