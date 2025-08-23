import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
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
  const { isDark, toggleTheme } = useTheme()

  const stats = [
    { title: "Total Users", value: "1,234", icon: Users, color: "blue" },
    { title: "Companies", value: "456", icon: Building2, color: "green" },
    { title: "Active Jobs", value: "789", icon: Briefcase, color: "purple" },
    { title: "Applications", value: "2,345", icon: Shield, color: "orange" },
  ]

  return (
    <div className={"min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900"}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-100/30 to-purple-200/30 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-slate-100/30 to-indigo-200/30 dark:from-slate-900/20 dark:to-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className={"relative z-10 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-colors duration-300"}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={"text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300"}>
                  Admin Control Center
                </h1>
                <p className={"text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300"}>
                  System Administration & Monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={"transition-colors duration-300 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <div className={"flex items-center space-x-2 backdrop-blur-sm rounded-full px-4 py-2 border bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 transition-colors duration-300"}>
                <Settings className="w-4 h-4 text-indigo-600" />
                <span className={"text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300"}>
                  System Active
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className={"transition-colors duration-300 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}
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
          <h2 className={"text-3xl font-bold mb-2 text-slate-800 dark:text-white"}>
            System Overview
          </h2>
          <p className={"text-slate-600 dark:text-slate-300"}>
            Monitor and manage platform statistics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className={"bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={"text-sm font-medium text-slate-600 dark:text-slate-300"}>
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
              </CardHeader>
              <CardContent>
                <div className={"text-2xl font-bold text-slate-900 dark:text-white"}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={"bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm"}>
            <CardHeader>
              <CardTitle className={"text-slate-800 dark:text-white"}>
                Recent Activity
              </CardTitle>
              <CardDescription className={"text-slate-600 dark:text-slate-300"}>
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
                    <span className={"text-sm text-slate-700 dark:text-slate-300"}>
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

          <Card className={"bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm"}>
            <CardHeader>
              <CardTitle className={"text-slate-800 dark:text-white"}>
                Quick Actions
              </CardTitle>
              <CardDescription className={"text-slate-600 dark:text-slate-300"}>
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
