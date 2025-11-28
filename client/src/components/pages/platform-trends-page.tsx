"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Eye, 
  Users,
  BarChart3,
  Activity,
  Clock,
  Shield,
  Zap,
  Target
} from 'lucide-react';

// Mock data for different platforms
const platformData = {
  twitter: {
    name: 'Twitter/X',
    icon: '𝕏',
    color: '#1DA1F2',
    totalPosts: 2450000,
    reportedCases: 1250,
    unreportedCases: 3400,
    verified: 890,
    unverified: 4760,
    trend: 12.3,
    engagement: 85.2
  },
  facebook: {
    name: 'Facebook',
    icon: 'F',
    color: '#4267B2',
    totalPosts: 1890000,
    reportedCases: 980,
    unreportedCases: 2800,
    verified: 650,
    unverified: 3130,
    trend: -8.1,
    engagement: 72.4
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    totalPosts: 1650000,
    reportedCases: 720,
    unreportedCases: 2100,
    verified: 480,
    unverified: 2340,
    trend: 15.7,
    engagement: 91.8
  },
  youtube: {
    name: 'YouTube',
    icon: '▶',
    color: '#FF0000',
    totalPosts: 850000,
    reportedCases: 340,
    unreportedCases: 950,
    verified: 210,
    unverified: 1080,
    trend: -3.2,
    engagement: 78.9
  },
  tiktok: {
    name: 'TikTok',
    icon: '🎵',
    color: '#FE2C55',
    totalPosts: 3200000,
    reportedCases: 1890,
    unreportedCases: 4200,
    verified: 1120,
    unverified: 4970,
    trend: 28.4,
    engagement: 95.6
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    totalPosts: 980000,
    reportedCases: 520,
    unreportedCases: 1200,
    verified: 280,
    unverified: 1440,
    trend: 6.8,
    engagement: 68.3
  }
};

const topMisinformationTopics = [
  { topic: 'Election Fraud Claims', count: 2450, verified: false, platforms: ['Twitter', 'Facebook', 'YouTube'] },
  { topic: 'Vaccine Misinformation', count: 1890, verified: false, platforms: ['WhatsApp', 'Telegram', 'Facebook'] },
  { topic: 'Climate Change Denial', count: 1650, verified: false, platforms: ['Twitter', 'YouTube', 'TikTok'] },
  { topic: 'Economic Recession Rumors', count: 1420, verified: true, platforms: ['Twitter', 'LinkedIn', 'News'] },
  { topic: 'Celebrity Death Hoax', count: 980, verified: false, platforms: ['Instagram', 'TikTok', 'Twitter'] }
];

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
};

const WidgetCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className={`bg-background/60 backdrop-blur-lg rounded-2xl border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

interface PlatformData {
  name: string;
  icon: string;
  color: string;
  totalPosts: number;
  reportedCases: number;
  unreportedCases: number;
  verified: number;
  unverified: number;
  trend: number;
  engagement: number;
}

const PlatformWidget = ({ data, delay = 0 }: { data: PlatformData, delay?: number }) => (
  <WidgetCard delay={delay}>
    <Card className="h-full border-0 bg-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: data.color }}
            >
              {data.icon}
            </div>
            <div>
              <CardTitle className="text-lg text-text-900 dark:text-text-100">{data.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {data.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${data.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.trend > 0 ? '+' : ''}{data.trend}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-text-600 dark:text-text-400">Reported</span>
            </div>
            <span className="text-lg font-bold text-text-900 dark:text-text-100">
              {formatNumber(data.reportedCases)}
            </span>
          </div>
          <div className="bg-background/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-text-600 dark:text-text-400">Unreported</span>
            </div>
            <span className="text-lg font-bold text-text-900 dark:text-text-100">
              {formatNumber(data.unreportedCases)}
            </span>
          </div>
        </div>
        
        <div className="bg-background/40 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-600 dark:text-text-400">Verification Status</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600">Verified</span>
              </div>
              <span className="text-sm font-semibold text-text-900 dark:text-text-100">
                {formatNumber(data.verified)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-600">Unverified</span>
              </div>
              <span className="text-sm font-semibold text-text-900 dark:text-text-100">
                {formatNumber(data.unverified)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-background/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-text-600 dark:text-text-400">Engagement Rate</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{data.engagement}%</span>
        </div>
      </CardContent>
    </Card>
  </WidgetCard>
);

const TrendChart = ({ delay = 0 }: { delay?: number }) => (
  <WidgetCard delay={delay} className="lg:col-span-2">
    <Card className="h-full border-0 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-text-900 dark:text-text-100">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Misinformation Trends (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/50 dark:to-accent-950/50 rounded-xl flex items-center justify-center border border-border/10">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-text-400 mx-auto mb-4" />
            <span className="text-text-500 font-medium">Interactive Trend Chart</span>
            <p className="text-sm text-text-400 mt-2">Platform comparison over time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </WidgetCard>
);

const TopTopicsWidget = ({ delay = 0 }: { delay?: number }) => (
  <WidgetCard delay={delay}>
    <Card className="h-full border-0 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-text-900 dark:text-text-100">
          <Target className="w-5 h-5 text-red-500" />
          Top Misinformation Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topMisinformationTopics.slice(0, 4).map((topic, index) => (
            <motion.div
              key={topic.topic}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + index * 0.1 }}
              className="bg-background/40 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-800 dark:text-text-200">
                  {topic.topic}
                </span>
                <Badge variant={topic.verified ? "success" : "destructive"} className="text-xs">
                  {topic.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-600 dark:text-text-400">
                  {topic.platforms.join(', ')}
                </span>
                <span className="text-sm font-bold text-text-900 dark:text-text-100">
                  {formatNumber(topic.count)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  </WidgetCard>
);

const StatsWidget = ({ delay = 0 }: { delay?: number }) => (
  <WidgetCard delay={delay}>
    <Card className="h-full border-0 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-text-900 dark:text-text-100">
          <Shield className="w-5 h-5 text-green-500" />
          Global Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg p-3 border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-600">Total Threats Detected</span>
            </div>
            <span className="text-2xl font-bold text-red-600">12,450</span>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-3 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600">Successfully Verified</span>
            </div>
            <span className="text-2xl font-bold text-green-600">8,920</span>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-600">Active Monitoring</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">247</span>
            <span className="text-xs text-blue-500 ml-1">platforms</span>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-600">Response Time</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">2.3</span>
            <span className="text-xs text-purple-500 ml-1">minutes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </WidgetCard>
);

export function PlatformTrendsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-background-100 to-background-50 dark:from-background-900 dark:to-background-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-900 dark:text-text-100 mb-2">Platform Trends</h1>
          <p className="text-text-600 dark:text-text-400">
            Monitor misinformation patterns and trends across social media platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Real-time</span>
          </motion.div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* <TabsList className="grid w-full grid-cols-5 rounded-xl bg-background/60 backdrop-blur-lg border border-border/20">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="platforms" className="rounded-lg">Platforms</TabsTrigger>
          <TabsTrigger value="trends" className="rounded-lg">Trends</TabsTrigger>
          <TabsTrigger value="verification" className="rounded-lg">Verification</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
        </TabsList> */}

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsWidget delay={0.1} />
            <TopTopicsWidget delay={0.2} />
            <TrendChart delay={0.3} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(platformData).map(([platform, data], index) => (
              <PlatformWidget 
                key={platform}
                data={data} 
                delay={0.4 + index * 0.1} 
              />
            ))}
          </div>
        </TabsContent>

        {/* <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(platformData).map(([platform, data], index) => (
              <PlatformWidget 
                key={platform} 
                platform={platform} 
                data={data} 
                delay={index * 0.1} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart delay={0.1} />
            <WidgetCard delay={0.2}>
              <Card className="h-full border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-900 dark:text-text-100">
                    <PieChart className="w-5 h-5 text-secondary-600" />
                    Platform Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950/50 dark:to-primary-950/50 rounded-xl flex items-center justify-center border border-border/10">
                    <div className="text-center">
                      <PieChart className="w-16 h-16 text-text-400 mx-auto mb-4" />
                      <span className="text-text-500 font-medium">Platform Share Analysis</span>
                      <p className="text-sm text-text-400 mt-2">Misinformation distribution by platform</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </WidgetCard>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WidgetCard delay={0.1}>
              <Card className="h-full border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-900 dark:text-text-100">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Verification Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: "Pending Review", count: 234, color: "yellow" },
                      { status: "In Progress", count: 156, color: "blue" },
                      { status: "Verified True", count: 89, color: "green" },
                      { status: "Verified False", count: 445, color: "red" }
                    ].map((item, index) => (
                      <div key={item.status} className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
                        <span className="text-sm text-text-700 dark:text-text-300">{item.status}</span>
                        <Badge 
                          variant={item.color === 'green' ? 'success' : item.color === 'red' ? 'destructive' : 'secondary'}
                          className="font-bold"
                        >
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </WidgetCard>
            
            <TopTopicsWidget delay={0.2} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsWidget delay={0.1} />
            <WidgetCard delay={0.2}>
              <Card className="h-full border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-text-900 dark:text-text-100">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Geographic Spread
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { region: "North America", percentage: 35, count: "4.2K" },
                      { region: "Europe", percentage: 28, count: "3.4K" },
                      { region: "Asia Pacific", percentage: 22, count: "2.7K" },
                      { region: "Others", percentage: 15, count: "1.8K" }
                    ].map((region, index) => (
                      <div key={region.region} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-700 dark:text-text-300">{region.region}</span>
                          <span className="font-bold text-text-900 dark:text-text-100">{region.count}</span>
                        </div>
                        <div className="w-full bg-background/40 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${region.percentage}%` }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                            className="bg-blue-500 h-2 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </WidgetCard>
            <TrendChart delay={0.3} />
          </div>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}

export default PlatformTrendsPage;
