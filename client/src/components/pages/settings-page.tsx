"use client";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Settings,
  User,
  Bell,
  Shield,
  Key,
  Globe,
  Palette,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Zap,
  Activity,
  BarChart3,
  Clock
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: "active" | "expired" | "revoked";
}

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "api" | "preferences">("profile");

  // User Profile State
  const [profile, setProfile] = useState({
    name: "Priya Sharma",
    email: "priya.sharma@civicshield.ai",
    phone: "+91 98765 43210",
    role: "Crisis Manager",
    organization: "Election Commission of India",
    location: "New Delhi, India",
    joinDate: "January 2024",
    bio: "Crisis management specialist with 8+ years of experience in election monitoring and threat response coordination."
  });

  // Notification Settings
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: "1", label: "Critical Threats", description: "Immediate alerts for critical security threats", enabled: true, category: "alerts" },
    { id: "2", label: "Deepfake Detection", description: "Notifications when deepfakes are detected", enabled: true, category: "alerts" },
    { id: "3", label: "Bot Network Activity", description: "Alerts for suspicious bot network behavior", enabled: true, category: "alerts" },
    { id: "4", label: "Daily Summary", description: "Daily digest of platform activities", enabled: true, category: "reports" },
    { id: "5", label: "Weekly Reports", description: "Comprehensive weekly analysis reports", enabled: false, category: "reports" },
    { id: "6", label: "Team Updates", description: "Notifications from response team members", enabled: true, category: "team" },
    { id: "7", label: "System Maintenance", description: "System updates and maintenance schedules", enabled: false, category: "system" },
    { id: "8", label: "API Usage Alerts", description: "Notifications about API rate limits", enabled: true, category: "system" }
  ]);

  // API Keys
  const [apiKeys] = useState<ApiKey[]>([
    { id: "1", name: "Production API", key: "sk_live_••••••••••••8xY2", created: "2024-01-15", lastUsed: "2 hours ago", status: "active" },
    { id: "2", name: "Development API", key: "sk_dev_••••••••••••3mP9", created: "2024-03-20", lastUsed: "5 days ago", status: "active" },
    { id: "3", name: "Testing API", key: "sk_test_••••••••••••1kL7", created: "2024-02-10", lastUsed: "Never", status: "expired" }
  ]);

  const handleNotificationToggle = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log("Profile saved:", profile);
  };

  const stats = [
    { title: "Total Alerts Reviewed", value: "1,247", icon: AlertTriangle, color: "red" },
    { title: "Response Time Avg", value: "4.2min", icon: Clock, color: "blue" },
    { title: "Cases Resolved", value: "892", icon: Check, color: "green" },
    { title: "Active Sessions", value: "3", icon: Activity, color: "purple" }
  ];

  return (
    <div>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
              <Settings className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-900 dark:text-text-100">
                Settings & Profile
              </h1>
              <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                Manage your account, preferences, and security settings
              </p>
            </div>
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6"
      >
        {stats.map((stat, i) => {
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
                    </div>
                    <div className={`p-3 rounded-full ${
                      stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' : 
                      stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' : 
                      stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' : 
                      'bg-purple-100 dark:bg-purple-900/20'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        stat.color === 'red' ? 'text-red-600' : 
                        stat.color === 'green' ? 'text-green-600' : 
                        stat.color === 'blue' ? 'text-blue-600' : 
                        'text-purple-600'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-lg border-r-white border-b-white">
          <CardContent className="p-2">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "security", label: "Security", icon: Shield },
                { id: "api", label: "API Keys", icon: Key },
                { id: "preferences", label: "Preferences", icon: Palette }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "profile" | "notifications" | "security" | "api" | "preferences")}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={`gap-2 ${activeTab === tab.id ? 'bg-primary-600 text-white' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2">
          {/* Profile Section */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-text-800 text-2xl dark:text-text-200">Profile Information</CardTitle>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start gap-6 mb-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="/api/placeholder/96/96" />
                      <AvatarFallback className="text-2xl font-bold bg-primary-600 text-white">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-text-900 dark:text-text-100 mb-1">
                        {profile.name}
                      </h2>
                      <p className="text-text-600 dark:text-text-400 mb-2">{profile.role}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{profile.organization}</Badge>
                        <Badge variant="outline">Joined {profile.joinDate}</Badge>
                      </div>
                      {isEditing && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Upload className="w-3 h-3" />
                            Upload Photo
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2 text-red-600">
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </label>
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4" />
                          Role
                        </label>
                        <Input
                          value={profile.role}
                          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4" />
                          Organization
                        </label>
                        <Input
                          value={profile.organization}
                          onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </label>
                        <Input
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          disabled={!isEditing}
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                        <Edit className="w-4 h-4" />
                        Bio
                      </label>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                      <Bell className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-text-800 text-2xl dark:text-text-200">Notification Preferences</CardTitle>
                      <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                        Manage how and when you receive notifications
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {["alerts", "reports", "team", "system"].map((category) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-text-800 dark:text-text-200 mb-3 capitalize">
                          {category}
                        </h3>
                        <div className="space-y-3">
                          {notifications.filter(n => n.category === category).map((notif) => (
                            <div
                              key={notif.id}
                              className="flex items-center justify-between p-4 bg-background/30 hover:bg-background/50 transition-colors border border-border/10"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-text-700 dark:text-text-300">
                                  {notif.label}
                                </p>
                                <p className="text-sm text-text-500 dark:text-text-400">
                                  {notif.description}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleNotificationToggle(notif.id)}
                                variant={notif.enabled ? "default" : "outline"}
                                size="sm"
                                className="gap-2"
                              >
                                {notif.enabled ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Enabled
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    Disabled
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                        {category !== "system" && <Separator className="mt-6" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Security Section */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-text-800 text-2xl dark:text-text-200">Security Settings</CardTitle>
                      <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                        Manage your password and security preferences
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-800 dark:text-text-200 mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4" />
                            Current Password
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              className="bg-background/50 pr-10"
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-500 hover:text-text-700"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4" />
                            New Password
                          </label>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4" />
                            Confirm New Password
                          </label>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            className="bg-background/50"
                          />
                        </div>
                        <Button className="gap-2">
                          <Save className="w-4 h-4" />
                          Update Password
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Two-Factor Authentication */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-800 dark:text-text-200 mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-text-700 dark:text-text-300">
                              2FA is Enabled
                            </p>
                            <p className="text-sm text-text-500">
                              Your account is protected with two-factor authentication
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Active Sessions */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-800 dark:text-text-200 mb-4">
                        Active Sessions
                      </h3>
                      <div className="space-y-3">
                        {[
                          { device: "Chrome on Windows", location: "New Delhi, India", time: "Active now", current: true },
                          { device: "Mobile App on Android", location: "Mumbai, India", time: "2 hours ago", current: false },
                          { device: "Safari on MacBook", location: "Bengaluru, India", time: "1 day ago", current: false }
                        ].map((session, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4 bg-background/30 hover:bg-background/50 transition-colors border border-border/10"
                          >
                            <div>
                              <p className="font-medium text-text-700 dark:text-text-300 flex items-center gap-2">
                                {session.device}
                                {session.current && (
                                  <Badge variant="default" className="text-xs">Current</Badge>
                                )}
                              </p>
                              <p className="text-sm text-text-500">
                                {session.location} • {session.time}
                              </p>
                            </div>
                            {!session.current && (
                              <Button variant="outline" size="sm" className="text-red-600">
                                Revoke
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* API Keys Section */}
          {activeTab === "api" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                        <Key className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-text-800 text-2xl dark:text-text-200">API Keys</CardTitle>
                        <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                          Manage your API keys for programmatic access
                        </p>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Zap className="w-4 h-4" />
                      Generate New Key
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="p-4 bg-background/30 hover:bg-background/50 transition-colors border border-border/10"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-text-700 dark:text-text-300 mb-1">
                              {key.name}
                            </h3>
                            <p className="text-sm font-mono text-text-500">
                              {key.key}
                            </p>
                          </div>
                          <Badge
                            variant={key.status === "active" ? "success" : key.status === "expired" ? "warning" : "destructive"}
                          >
                            {key.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-text-500">
                          <div className="flex gap-4">
                            <span>Created: {key.created}</span>
                            <span>Last used: {key.lastUsed}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-text-800 dark:text-text-200 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      API Usage Guidelines
                    </h4>
                    <ul className="text-sm text-text-600 dark:text-text-400 space-y-1 ml-7">
                      <li>• Keep your API keys secure and never share them publicly</li>
                      <li>• Rotate keys regularly for enhanced security</li>
                      <li>• Monitor usage to detect unauthorized access</li>
                      <li>• Use environment-specific keys (dev, staging, production)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Preferences Section */}
          {activeTab === "preferences" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/20">
                      <Palette className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-text-800 text-2xl dark:text-text-200">Application Preferences</CardTitle>
                      <p className="text-sm text-text-600 dark:text-text-400 mt-1">
                        Customize your CivicShield AI experience
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Theme */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-800 dark:text-text-200 mb-4">
                        Appearance
                      </h3>
                      <div className="flex items-center justify-between p-4 bg-background/30 border border-border/10">
                        <div>
                          <p className="font-medium text-text-700 dark:text-text-300">Theme</p>
                          <p className="text-sm text-text-500">Choose your preferred color scheme</p>
                        </div>
                        <ThemeToggle />
                      </div>
                    </div>

                    <Separator />

                    {/* Language & Region */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-800 dark:text-text-200 mb-4">
                        Language & Region
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4" />
                            Language
                          </label>
                          <select className="w-full p-2 border border-border/20 rounded-md bg-background/50 text-text-700 dark:text-text-300">
                            <option>English (US)</option>
                            <option>हिंदी (Hindi)</option>
                            <option>বাংলা (Bengali)</option>
                            <option>తెలుగు (Telugu)</option>
                            <option>मराठी (Marathi)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-700 dark:text-text-300 flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4" />
                            Timezone
                          </label>
                          <select className="w-full p-2 border border-border/20 rounded-md bg-background/50 text-text-700 dark:text-text-300">
                            <option>Asia/Kolkata (IST)</option>
                            <option>Asia/Dubai (GST)</option>
                            <option>Europe/London (GMT)</option>
                            <option>America/New_York (EST)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Data & Privacy */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-800 dark:text-text-200 mb-4">
                        Data & Privacy
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-background/30 hover:bg-background/50 transition-colors border border-border/10">
                          <div>
                            <p className="font-medium text-text-700 dark:text-text-300">Analytics Collection</p>
                            <p className="text-sm text-text-500">Help improve CivicShield by sharing usage data</p>
                          </div>
                          <Button variant="default" size="sm" className="gap-2">
                            <Check className="w-4 h-4" />
                            Enabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-background/30 hover:bg-background/50 transition-colors border border-border/10">
                          <div>
                            <p className="font-medium text-text-700 dark:text-text-300">Data Export</p>
                            <p className="text-sm text-text-500">Download all your data in JSON format</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Delete Account</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
                          </div>
                          <Button variant="destructive" size="sm" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <div>
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-text-800 dark:text-text-200 flex items-center gap-2 text-xl">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-2">
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <Download className="w-4 h-4" />
                    Export Account Data
                  </Button>
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <RefreshCw className="w-4 h-4" />
                    Reset Preferences
                  </Button>
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <Activity className="w-4 h-4" />
                    View Activity Log
                  </Button>
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4" />
                    Usage Statistics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Status */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-text-800 dark:text-text-200 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-500" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-text-700 dark:text-text-300">Verified</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-text-700 dark:text-text-300">2FA Enabled</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-text-700 dark:text-text-300">Premium Plan</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-600 dark:text-text-400">Member Since</span>
                      <span className="font-medium text-text-700 dark:text-text-300">{profile.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-600 dark:text-text-400">Last Login</span>
                      <span className="font-medium text-text-700 dark:text-text-300">Today at 14:32</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-600 dark:text-text-400">Account ID</span>
                      <span className="font-mono text-xs text-text-500">USR-2024-8472</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help & Support */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="rounded-none bg-background/60 backdrop-blur-lg shadow-xl border-b-white border-r-white hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-text-800 dark:text-text-200 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-blue-500" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <a href="#" className="block p-3 bg-background/30 hover:bg-background/50 transition-colors border border-border/10 text-text-700 dark:text-text-300">
                    📚 Documentation
                  </a>
                  <a href="#" className="block p-3 bg-background/30 hover:bg-background/50 transition-colors border border-border/10 text-text-700 dark:text-text-300">
                    💬 Contact Support
                  </a>
                  <a href="#" className="block p-3 bg-background/30 hover:bg-background/50 transition-colors border border-border/10 text-text-700 dark:text-text-300">
                    🐛 Report a Bug
                  </a>
                  <a href="#" className="block p-3 bg-background/30 hover:bg-background/50 transition-colors border border-border/10 text-text-700 dark:text-text-300">
                    ⭐ Feature Request
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
