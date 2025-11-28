"use client";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Shield, 
  Siren, 
  Users, 
  Activity, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Bell,
  BellOff,
  Radio,
  Eye,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  MessageSquare
} from "lucide-react";
import { useState } from "react";

interface CrisisAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  location: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved" | "escalated";
  affectedUsers: number;
  platform: string;
  category: string;
}

interface ResponseTeam {
  name: string;
  role: string;
  status: "active" | "standby" | "offline";
  avatar: string;
}

export default function CrisisModePage() {
  const [crisisMode, setCrisisMode] = useState<boolean>(true);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const crisisAlerts: CrisisAlert[] = [
    {
      id: "1",
      title: "Mass Deepfake Video Campaign Detected",
      description: "Coordinated spread of deepfake videos targeting election candidates across multiple platforms",
      severity: "critical",
      location: "Mumbai, Maharashtra",
      timestamp: "2 min ago",
      status: "active",
      affectedUsers: 125000,
      platform: "WhatsApp, Facebook",
      category: "Deepfake"
    },
    {
      id: "2",
      title: "Bot Network Spreading Voter Suppression",
      description: "Automated bot network spreading false information about polling booth closures",
      severity: "critical",
      location: "Delhi NCR",
      timestamp: "8 min ago",
      status: "investigating",
      affectedUsers: 89000,
      platform: "Twitter/X",
      category: "Bot Network"
    },
    {
      id: "3",
      title: "Viral Misinformation About EVM Tampering",
      description: "Unverified claims about EVM hacking spreading rapidly on social media",
      severity: "high",
      location: "Bengaluru, Karnataka",
      timestamp: "15 min ago",
      status: "escalated",
      affectedUsers: 67000,
      platform: "Instagram, Twitter",
      category: "Misinformation"
    },
    {
      id: "4",
      title: "Fake Official Election Commission Account",
      description: "Impersonation account posting false election updates and causing confusion",
      severity: "high",
      location: "Nationwide",
      timestamp: "32 min ago",
      status: "investigating",
      affectedUsers: 45000,
      platform: "Twitter/X",
      category: "Impersonation"
    },
    {
      id: "5",
      title: "Coordinated Hate Speech Campaign",
      description: "Organized campaign targeting specific communities to influence voting behavior",
      severity: "medium",
      location: "Kolkata, West Bengal",
      timestamp: "1 hour ago",
      status: "active",
      affectedUsers: 28000,
      platform: "Facebook, WhatsApp",
      category: "Hate Speech"
    }
  ];

  const responseTeams: ResponseTeam[] = [
    { name: "Priya Sharma", role: "Crisis Manager", status: "active", avatar: "PS" },
    { name: "Rajesh Kumar", role: "Fact-Check Lead", status: "active", avatar: "RK" },
    { name: "Ananya Desai", role: "Social Media Monitor", status: "active", avatar: "AD" },
    { name: "Vikram Singh", role: "Legal Advisor", status: "standby", avatar: "VS" },
    { name: "Meera Patel", role: "Communications", status: "standby", avatar: "MP" }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "red";
      case "high": return "orange";
      case "medium": return "yellow";
      case "low": return "blue";
      default: return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "red";
      case "investigating": return "yellow";
      case "escalated": return "orange";
      case "resolved": return "green";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return AlertCircle;
      case "investigating": return Eye;
      case "escalated": return TrendingUp;
      case "resolved": return CheckCircle;
      default: return AlertTriangle;
    }
  };

  return (
    <div>
      {/* Crisis Mode Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`mb-6 p-4 rounded-none ${crisisMode ? 'bg-red-500/10 border-2 border-red-500/30' : 'bg-green-500/10 border-2 border-green-500/30'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`p-3 rounded-full ${crisisMode ? 'bg-red-500' : 'bg-green-500'}`}
            >
              <Siren className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-text-900 dark:text-text-100">
                {crisisMode ? "🚨 CRISIS MODE ACTIVE" : "✅ Normal Operations"}
              </h1>
              <p className="text-sm text-text-600 dark:text-text-400">
                {crisisMode 
                  ? "Emergency response protocols activated. All teams on high alert."
                  : "All systems operational. No critical threats detected."}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setCrisisMode(!crisisMode)}
            variant={crisisMode ? "destructive" : "default"}
            className="gap-2"
          >
            {crisisMode ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            {crisisMode ? "Deactivate Crisis Mode" : "Activate Crisis Mode"}
          </Button>
        </div>
      </motion.div>

      {/* Top Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: "Active Crises", value: "5", change: "+2 in last hour", icon: AlertTriangle, color: "red" },
          { title: "Response Teams", value: "3", change: "2 on standby", icon: Shield, color: "blue" },
          { title: "Affected Users", value: "354K", change: "+15% growth rate", icon: Users, color: "orange" },
          { title: "Avg Response Time", value: "4.2min", change: "-12% improvement", icon: Clock, color: "green" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
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
                      <p className={`text-sm font-medium ${stat.color === 'red' ? 'text-red-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'blue' ? 'text-blue-600' : 'text-orange-600'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' : stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' : stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-orange-100 dark:bg-orange-900/20'}`}>
                      <Icon className={`w-6 h-6 ${stat.color === 'red' ? 'text-red-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'blue' ? 'text-blue-600' : 'text-orange-600'}`} />
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
          {/* Active Crisis Alerts */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-text-800 text-2xl dark:text-text-200">Active Crisis Alerts</CardTitle>
                      <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                        Real-time monitoring of critical threats requiring immediate attention
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="gap-1">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                    5 Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {crisisAlerts.map((alert, i) => {
                    const StatusIcon = getStatusIcon(alert.status);
                    const severityColor = getSeverityColor(alert.severity);
                    const statusColor = getStatusColor(alert.status);
                    
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className={`p-4 border-l-4 ${
                          severityColor === 'red' ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' :
                          severityColor === 'orange' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10' :
                          severityColor === 'yellow' ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' :
                          'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                        } hover:shadow-md transition-all duration-300 cursor-pointer`}
                        onClick={() => setSelectedAlert(alert.id === selectedAlert ? null : alert.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={severityColor === 'red' ? 'destructive' : 'default'} className="text-xs">
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge 
                                variant={statusColor === 'red' ? 'destructive' : statusColor === 'green' ? 'success' : 'secondary'}
                                className="text-xs gap-1"
                              >
                                <StatusIcon className="w-3 h-3" />
                                {alert.status}
                              </Badge>
                              <span className="text-xs text-text-500">{alert.timestamp}</span>
                            </div>
                            <h3 className="font-bold text-text-900 dark:text-text-100 mb-1">
                              {alert.title}
                            </h3>
                            <p className="text-sm text-text-600 dark:text-text-400 mb-3">
                              {alert.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-text-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {alert.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {alert.affectedUsers.toLocaleString()} affected
                              </span>
                              <span className="flex items-center gap-1">
                                <Radio className="w-3 h-3" />
                                {alert.platform}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {alert.category}
                              </span>
                            </div>
                            
                            {/* Expanded Actions */}
                            {selectedAlert === alert.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-border/20 flex gap-2"
                              >
                                <Button size="sm" variant="destructive" className="gap-1">
                                  <Zap className="w-3 h-3" />
                                  Escalate
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  Contact Team
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1">
                                  <Eye className="w-3 h-3" />
                                  View Details
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Mark Resolved
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Crisis Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-text-800 dark:text-text-200">Crisis Response Timeline</CardTitle>
                    <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                      Recent actions and escalations
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { time: "14:32", action: "Crisis alert #1 escalated to national level", user: "Priya Sharma", type: "escalation" },
                    { time: "14:28", action: "Fact-check team deployed for Mumbai deepfake case", user: "Rajesh Kumar", type: "action" },
                    { time: "14:25", action: "Emergency notification sent to 125K users", user: "System", type: "notification" },
                    { time: "14:20", action: "Bot network identified and reported to platform", user: "Ananya Desai", type: "detection" },
                    { time: "14:15", action: "Legal team contacted for impersonation case", user: "Vikram Singh", type: "legal" },
                    { time: "14:10", action: "Media response prepared for press release", user: "Meera Patel", type: "communication" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.4 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          item.type === 'escalation' ? 'bg-red-500' :
                          item.type === 'action' ? 'bg-blue-500' :
                          item.type === 'notification' ? 'bg-yellow-500' :
                          item.type === 'detection' ? 'bg-purple-500' :
                          item.type === 'legal' ? 'bg-orange-500' :
                          'bg-green-500'
                        }`} />
                        {i < 5 && <div className="w-0.5 h-full bg-border/30 mt-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-text-500">{item.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-700 dark:text-text-300 font-medium mb-1">
                          {item.action}
                        </p>
                        <p className="text-xs text-text-500">
                          by {item.user}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - 1/3 width */}
        <div>
          {/* Response Teams */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-text-800 dark:text-text-200 flex items-center gap-2 text-2xl">
                  <Shield className="w-7 h-7 text-blue-500" />
                  Response Teams
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-3">
                  {responseTeams.map((team, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="flex items-center gap-3 p-3 bg-background/30 hover:bg-background/50 transition-colors border border-border/10"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        team.status === 'active' ? 'bg-green-500' :
                        team.status === 'standby' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`}>
                        {team.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-700 dark:text-text-300">
                          {team.name}
                        </p>
                        <p className="text-xs text-text-500">
                          {team.role}
                        </p>
                      </div>
                      <Badge 
                        variant={team.status === 'active' ? 'success' : team.status === 'standby' ? 'warning' : 'secondary'}
                        className="text-xs"
                      >
                        {team.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <Button className="w-full gap-2" variant="outline">
                    <Phone className="w-4 h-4" />
                    Emergency Contact
                  </Button>
                  <Button className="w-full gap-2" variant="outline">
                    <Mail className="w-4 h-4" />
                    Send Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-text-800 dark:text-text-200 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Button className="w-full gap-2 justify-start" variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Trigger Emergency Protocol
                  </Button>
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <Bell className="w-4 h-4" />
                    Send Mass Notification
                  </Button>
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <Shield className="w-4 h-4" />
                    Request Backup Team
                  </Button>
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <Phone className="w-4 h-4" />
                    Contact Authorities
                  </Button>
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <MessageSquare className="w-4 h-4" />
                    Initiate Press Release
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Crisis Severity Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-text-800 dark:text-text-200 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-purple-500" />
                  Severity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { level: "Critical", count: 2, color: "red", percentage: 40 },
                    { level: "High", count: 2, color: "orange", percentage: 40 },
                    { level: "Medium", count: 1, color: "yellow", percentage: 20 },
                    { level: "Low", count: 0, color: "blue", percentage: 0 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-text-700 dark:text-text-300">
                          {item.level}
                        </span>
                        <span className="text-sm font-bold text-text-900 dark:text-text-100">
                          {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-background-200 dark:bg-background-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1 + 0.6 }}
                          className={`h-2 rounded-full ${
                            item.color === 'red' ? 'bg-red-500' :
                            item.color === 'orange' ? 'bg-orange-500' :
                            item.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}
                        />
                      </div>
                    </div>
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
