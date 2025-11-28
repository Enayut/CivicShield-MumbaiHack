"use client";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Map, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import HeatmapMap from "../Heatmap"; // Your existing wrapper

export default function HorizontalTimelineHeatmap() {
  // Placeholder for future refresh functionality
  const [, ] = useState(false);

type Priority = "critical" | "high" | "medium" | "low";

interface ActivityItem {
  time: string;
  event: string;
  priority: Priority;
  location: string;
  type: string;
}

const activityData: ActivityItem[] = [
  { 
    time: "2 min ago", 
    event: "Deepfake video detected targeting EVM integrity in Mumbai Metro", 
    priority: "critical",
    location: "Mumbai Metro",
    type: "Deepfake"
  },
  { 
    time: "8 min ago", 
    event: "Bot network spreading false voter registration deadline in Delhi NCR", 
    priority: "high",
    location: "Delhi NCR",
    type: "Bot Network"
  },
  { 
    time: "15 min ago", 
    event: "Viral post about polling booth changes verified as false", 
    priority: "medium",
    location: "Bangalore Tech",
    type: "Viral Content"
  },
  { 
    time: "1 hour ago", 
    event: "Coordinated misinformation campaign detected across multiple platforms", 
    priority: "high",
    location: "Chennai East",
    type: "Campaign"
  },
  { 
    time: "2 hours ago", 
    event: "Fact-check verification completed for candidate claims", 
    priority: "low",
    location: "Pune West",
    type: "Verification"
  },
  { 
    time: "3 hours ago", 
    event: "Suspicious account activity flagged by AI monitoring system", 
    priority: "medium",
    location: "Hyderabad",
    type: "Suspicious Activity"
  }
];




  

  return (
    <div className="min-h-screen">
      <div className="min-w-full">
        {/* Main Content Layout */}
        
          
          {/* Main Map Section */}
          <motion.div 
            className="w-full grid grid-cols-1 lg:grid-cols-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="col-span-3 bg-background/60 backdrop-blur-lg shadow-xl border border-r-white border-b-white rounded-none">
              <CardHeader className="">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Map className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
                      Interactive Threat Map
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base mt-1">
                      Real-time visualization of misinformation hotspots across regions
                    </CardDescription>
                  </div>
                  
                  {/* Map Legend */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-text-500">Critical</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-text-500">Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-text-500">Low</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                {/* Your existing HeatmapMap wrapper component */}
                <div className="rounded-xl overflow-hidden">
                  <HeatmapMap />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-lg shadow-lg border border-r-white border-b-white rounded-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Threat Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="space-y-3 md:space-y-4">
                  {[
                    { region: "Mumbai Metro", level: "Critical", color: "red", count: 45, trend: "+12%" },
                    { region: "Delhi NCR", level: "High", color: "orange", count: 32, trend: "+8%" },
                    { region: "Bangalore Tech", level: "Medium", color: "yellow", count: 18, trend: "-3%" },
                    { region: "Chennai East", level: "Low", color: "green", count: 8, trend: "-15%" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.5 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/10 hover:bg-background/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-700 dark:text-text-300 text-sm truncate">
                          {item.region}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            item.color === 'red' ? 'bg-red-500' :
                            item.color === 'orange' ? 'bg-orange-500' :
                            item.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <p className={`text-xs font-semibold ${
                            item.color === 'red' ? 'text-red-600' :
                            item.color === 'orange' ? 'text-orange-600' :
                            item.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {item.level}
                          </p>
                          <span className={`text-xs ml-auto ${
                            item.trend.startsWith('+') ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {item.trend}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg md:text-xl font-bold text-text-900 dark:text-text-100">
                          {item.count}
                        </p>
                        <p className="text-xs text-text-500">incidents</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar - Threat Levels */}
          {/* <motion.div
            className="lg:col-span-1 order-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            
          </motion.div> */}
        

        {/* Horizontal Activity Timeline Below Map */}
          <Card className="bg-background/60 backdrop-blur-lg p-0 m-0 shadow-lg border border-r-white border-b-gray-900 rounded-none">
            <CardContent>
              
              {/* Horizontal Marquee Timeline */}
              <div className="relative overflow-hidden">
                {/* Timeline Line */}
                <div className="absolute top-8 left-0 right-0 h-0.5 bg-border/30 z-10"></div>
                
                {/* Marquee Container */}
                <div className="relative">
                  {/* Timeline Items with Marquee Animation */}
                  <div 
                    className="flex animate-marquee"
                    style={{
                      animationDuration: `${activityData.length * 8}s`,
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite',
                      width: 'max-content'
                    }}
                  >
                    {/* Render items twice for seamless loop */}
                    {[...activityData, ...activityData].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i % activityData.length) * 0.1 + 0.7 }}
                        className="flex-shrink-0 w-64 sm:w-80 relative"
                      >
                        {/* Timeline Dot */}
                        {/* <div className={`absolute top-6 left-4 w-4 h-4 rounded-full border-2 border-background ${getPriorityColor(item.priority)} ${
                          item.priority === 'critical' ? 'animate-pulse shadow-lg' : ''
                        }`}></div> */}
                        
                        {/* Activity Card */}
                        <div className="bg-background/40 border border-r-white border-b-white rounded-none p-4 hover:bg-background/60 transition-all duration-200 hover:shadow-md mb-2">
                          {/* Header with Time and Priority */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-text-500" />
                              <span className="text-xs text-text-500 font-medium">{item.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                item.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                item.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                item.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                          </div>
                          
                          {/* Event Description */}
                          <p className="text-sm text-text-700 dark:text-text-300 leading-relaxed mb-3">
                            {item.event}
                          </p>
                          
                          {/* Footer with Location and Type */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-text-500">
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 px-2 py-0.5 rounded text-xs">
                                {item.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Auto-scroll Indicator */}
                {/* <div className="flex justify-center mt-3">
                  <div className="text-xs text-text-400 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-0.5 bg-text-400 rounded-full animate-pulse"></div>
                      <div className="w-4 h-0.5 bg-text-400 rounded-full"></div>
                      <div className="w-2 h-0.5 bg-text-400 rounded-full animate-pulse"></div>
                    </div>
                    <span>Auto-scrolling timeline</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-0.5 bg-text-400 rounded-full animate-pulse"></div>
                      <div className="w-4 h-0.5 bg-text-400 rounded-full"></div>
                      <div className="w-2 h-0.5 bg-text-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div> */}
              </div>
            </CardContent>
          </Card>
        

          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .animate-marquee {
              animation-name: marquee;
            }
            
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
      </div>
    </div>
  );
}