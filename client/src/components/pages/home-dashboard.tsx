"use client";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Shield, Users, BarChart3, Map } from "lucide-react";
import HeatmapMap from "../Heatmap";

export function HomeDashboard() {
  return (
    <div>
      {/* Top Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: "Active Threats", value: "23", change: "+12%", icon: AlertTriangle, color: "red" },
          { title: "Verified Claims", value: "156", change: "+8%", icon: Shield, color: "green" },
          { title: "Sources Monitored", value: "1,247", change: "+3%", icon: Users, color: "blue" },
          { title: "Platform Coverage", value: "98%", change: "+1%", icon: BarChart3, color: "purple" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              // whileHover={{ scale: 1.02, y: -2 }}
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
                      <p className={`text-sm font-medium ${stat.color === 'red' ? 'text-red-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`}>
                        {stat.change} from last week
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' : stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' : stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-purple-100 dark:bg-purple-900/20'}`}>
                      <Icon className={`w-6 h-6 ${stat.color === 'red' ? 'text-red-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2">
          {/* Heatmap Snapshot */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            // whileHover={{ scale: 1.01, y: -2 }} 
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                    <Map className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-text-800 text-2xl dark:text-text-200">Misinformation Heatmap</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent >
                <div className="h-80 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/50 dark:to-accent-950/50 flex items-center justify-center border border-border/10">
                  <HeatmapMap/>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform Trends */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            // whileHover={{ scale: 1.01, y: -2 }} 
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-900/20">
                    <TrendingUp className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-text-800 dark:text-text-200">Platform Trends</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-950/50 dark:to-primary-950/50 flex items-center justify-center border border-border/10">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-text-400 mx-auto mb-4" />
                    <span className="text-text-500 font-medium">Analytics Dashboard</span>
                    <p className="text-sm text-text-400 mt-2">Platform-specific misinformation metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - 1/3 width */}
        <div>
          {/* Top Election Hoaxes */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            // whileHover={{ scale: 1.02, y: -2 }} 
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-text-800 dark:text-text-200 flex items-center gap-2 text-2xl">
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                  Top Election Hoaxes
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-10.75">
                <div className="space-y-2.5">
                  {[
                    { claim: "Fake Ballot Boxes in City X", status: "True", color: "green" },
                    { claim: "Candidate Y Withdraws", status: "Unverified", color: "yellow" },
                    { claim: "Foreign Interference Confirmed", status: "False", color: "red" },
                    { claim: "Voting Machines Hacked", status: "True", color: "green" },
                    { claim: "Election Delayed", status: "Unverified", color: "yellow" },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="flex flex-col p-3 bg-background/30 hover:bg-background/50 transition-colors border border-border/10"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-text-700 dark:text-text-300 font-medium leading-relaxed w-3/4">
                          {item.claim}
                        </p>
                        <Badge
                          variant={item.color === 'green' ? 'success' : item.color === 'yellow' ? 'warning' : 'destructive'}
                          className="w-fit text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Crisis Mode Snapshot */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            // whileHover={{ scale: 1.01, y: -2 }} 
          >
            <Card className="rounded-none bg-red-500/5 backdrop-blur-lg shadow-xl border border-red-500/20 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                  <motion.span 
                    className="w-3 h-3 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  Crisis Mode Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { alert: "Coordinated misinformation surge detected in Region A", level: "critical", time: "2 min ago" },
                    { alert: "Multiple deepfake videos circulating on WhatsApp", level: "warning", time: "15 min ago" },
                    { alert: "Unusual bot activity on Twitter trending topics", level: "warning", time: "1 hour ago" },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.6 }}
                      className="flex items-start p-3 bg-background/20 hover:bg-background/30 transition-colors border border-border/10"
                    >
                      <motion.span 
                        className={`w-2 h-2 rounded-full mt-2 mr-3 ${item.level === 'critical' ? 'bg-red-500' : 'bg-yellow-400'}`}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-text-700 dark:text-text-300 font-medium mb-1">
                          {item.alert}
                        </p>
                        <p className="text-xs text-text-500 dark:text-text-400">
                          {item.time}
                        </p>
                      </div>
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