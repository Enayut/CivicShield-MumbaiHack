"use client";
import { motion } from "framer-motion";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
//import { TabBar } from "@/components/tab-bar";
import { TabContent } from "@/components/tab-content";
import { useTabStore, Tab } from "@/stores/tabStore";
import { HomeDashboard } from "@/components/pages/home-dashboard";
import HeatmapPage from "@/components/pages/heatmap-page";
import DeepfakePage from "./pages/deepfake-page";
import SourceGraph from "./pages/sourcegraph-page";
import PlatformTrendsPage from "./pages/platform-trends-page";
import AiFactcheckPage from "./pages/ai-factcheck-page";
import CrisisModePage from "./pages/crisis-mode-page";
import SettingsPage from "./pages/settings-page";
import { 
  Home, 
  Map, 
  TrendingUp, 
  Shield, 
  Network, 
  Bot, 
  AlertTriangle, 
  Settings 
} from "lucide-react";

const sidebarLinks = [
  { 
    id: "home", 
    label: "Home Dashboard", 
    href: "/", 
    icon: Home,
    component: HomeDashboard
  },
  { 
    id: "heatmap", 
    label: "Heatmap", 
    href: "/heatmap", 
    icon: Map,
    component: HeatmapPage
  },
  { 
    id: "platform-trends", 
    label: "Platform Trends", 
    href: "/platform-trends", 
    icon: TrendingUp,
    component: PlatformTrendsPage
  },
  { 
    id: "deepfake-detector", 
    label: "Deepfake Detector", 
    href: "/deepfake-detector", 
    icon: Shield,
    component: DeepfakePage
  },
  { 
    id: "source-graph", 
    label: "Source Graph", 
    href: "/source-graph", 
    icon: Network,
    component: SourceGraph
  },
  { 
    id: "fact-check-bots", 
    label: "AI Fact-Check Bots", 
    href: "/fact-check-bots", 
    icon: Bot,
    component: AiFactcheckPage
  },
  { 
    id: "crisis-mode", 
    label: "Crisis Mode", 
    href: "/crisis-mode", 
    icon: AlertTriangle,
    component: CrisisModePage
  },
  { 
    id: "settings", 
    label: "Settings / Profile", 
    href: "/settings", 
    icon: Settings,
    component: SettingsPage
  },
];

export default function DashboardLayout() {
  const { getActiveTab, addTab, setActiveTab, activeTabId } = useTabStore();

  const handleSidebarItemClick = (link: typeof sidebarLinks[0]) => {
    const tab: Tab = {
      id: link.id,
      title: link.label,
      href: link.href,
      icon: link.icon,
      component: link.component
    };
    addTab(tab);
    setActiveTab(link.id);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background-100 to-background-50 dark:from-background-900 dark:to-background-800">
        <Sidebar className="border-r border-white bg-background/30 backdrop-blur-xl">
          <SidebarHeader className="p-6">
            <motion.div
              initial={{ opacity: 0,  y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text">
                CivicShield AI
              </span>
            </motion.div>
          </SidebarHeader>
          
          <SidebarContent className="py-4 overflow-x-hidden whitespace-nowrap">
            <SidebarMenu className="relative">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeTabId === item.id;

                return (
                  <SidebarMenuItem key={item.id} className="relative">
                    {/* White Background Highlight */}
                    {isActive && (
                      <motion.div
                        layoutId="activeHighlight"
                        className="absolute inset-0 bg-white dark:bg-white shadow-lg border border-gray-200 dark:border-gray-300 rounded-none"
                        style={{
                          borderRadius: 0, // Rounded corners
                        }}
                        initial={{ opacity: 0, scale: 0.95, x: -10 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          x: 0,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30,
                          duration: 0.3
                        }}
                      />
                    )}
                    
                    <motion.div
                      whileHover={{ 
                        scale: 1.02,
                        x: isActive ? 0 : 4
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SidebarMenuButton
                        onClick={() => handleSidebarItemClick(item)}
                        className={`w-full text-lg justify-start gap-4 mb-3 p-4 pt-6 relative z-10 transition-all duration-300 ${
                          isActive
                            ? "text-black dark:text-black font-semibold bg-transparent"
                            : "text-text-700 dark:text-text-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
                        }`}
                        style={{ borderRadius: 8 }} // Rounded buttons to match highlight
                      >
                        <motion.div
                          animate={isActive ? { 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          } : {}}
                          transition={{ 
                            duration: 0.6,
                            ease: "easeInOut"
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.div>
                        
                        <motion.span
                          animate={isActive ? { 
                            x: [0, 2, 0]
                          } : {}}
                          transition={{ 
                            duration: 0.4,
                            ease: "easeInOut"
                          }}
                        >
                          {item.label}
                        </motion.span>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-4">
            <Separator className="mb-4" />
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <Avatar>
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-primary-100 text-primary-700">CS</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium text-sm text-text-800 dark:text-text-200">Admin</span>
                <p className="text-xs text-text-500 dark:text-text-400">CivicShield Monitor</p>
              </div>
            </motion.div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar with Sidebar Trigger and Theme Toggle */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-background/60" />
              <h2 className="text-lg font-semibold text-text-800 dark:text-text-200">
                {getActiveTab()?.title || 'CivicShield AI Dashboard'}
              </h2>
            </div>
            <ThemeToggle />
          </div>
          
          {/* Main Content */}
          <TabContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}