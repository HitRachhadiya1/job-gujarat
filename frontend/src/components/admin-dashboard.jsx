import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  LogOut, 
  Users, 
  Building2, 
  Briefcase,
  Moon,
  Sun,
  Settings
} from "lucide-react"

export default function AdminDashboard({ onLogout }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const stats = [
    { title: "Total Users", value: "1,234", icon: Users, color: "blue" },
    { title: "Companies", value: "456", icon: Building2, color: "green" },
    { title: "Active Jobs", value: "789", icon: Briefcase, color: "purple" },
    { title: "Applications", value: "2,345", icon: Shield, color: "orange" },
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900" 
        : "bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100"
    }`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-100/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-slate-100/30 to-indigo-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 backdrop-blur-sm border-b shadow-sm transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900/80 border-slate-700/50" : "bg-white/80 border-slate-200/50"
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}>
                  Admin Control Center
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}>
                  System Administration & Monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <div className={`flex items-center space-x-2 backdrop-blur-sm rounded-full px-4 py-2 border transition-colors duration-300 ${
                isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white/60 border-slate-200"
              }`}>
                <Settings className="w-4 h-4 text-indigo-600" />
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  System Active
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className={`transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
            System Overview
          </h2>
          <p className={`${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            Monitor and manage platform statistics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className={`${isDarkMode ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={`${isDarkMode ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? "text-white" : "text-slate-800"}`}>
                Recent Activity
              </CardTitle>
              <CardDescription className={`${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                Latest system events and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "New company registered", time: "2 minutes ago", type: "success" },
                  { action: "Job application submitted", time: "5 minutes ago", type: "info" },
                  { action: "User profile updated", time: "10 minutes ago", type: "info" },
                  { action: "System maintenance completed", time: "1 hour ago", type: "warning" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                      {activity.action}
                    </span>
                    <Badge variant={activity.type === "success" ? "default" : "secondary"} className="text-xs">
                      {activity.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={`${isDarkMode ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? "text-white" : "text-slate-800"}`}>
                Quick Actions
              </CardTitle>
              <CardDescription className={`${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                Administrative tools and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  Manage Users
                </Button>
                <Button variant="outline">
                  System Settings
                </Button>
                <Button variant="outline">
                  View Reports
                </Button>
                <Button variant="outline">
                  Backup Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
