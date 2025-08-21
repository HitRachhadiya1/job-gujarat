import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, ArrowRight, Briefcase, TrendingUp, UserCheck, Award, Globe, Moon, Sun } from "lucide-react"

export default function PublicRoutes({ onGetStarted }) {
  const { loginWithRedirect } = useAuth0();
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleGetStarted = () => {
    loginWithRedirect();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-100/30 to-slate-200/30 dark:from-blue-900/20 dark:to-slate-700/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-slate-100/30 to-blue-200/30 dark:from-slate-800/20 dark:to-blue-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-slate-700 dark:from-blue-500 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
                  JobPortal Pro
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Professional Career Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Badge className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/50 dark:to-slate-800/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                <Award className="w-3 h-3 mr-1" />
                Enterprise
              </Badge>
              <Badge className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                <Globe className="w-3 h-3 mr-1" />
                Global
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <h2 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-blue-700 dark:from-slate-200 dark:to-blue-400 leading-tight">
              Professional
            </h2>
            <div className="relative">
              <h2 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-slate-700 dark:from-blue-400 dark:to-slate-200 leading-tight">
                Careers
              </h2>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Connect with opportunities through our comprehensive career platform designed for modern professionals
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 dark:text-slate-400 mb-16">
            <div className="flex items-center space-x-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-slate-600 rounded-full"></div>
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">50K+ Jobs</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-slate-600 to-blue-500 rounded-full"></div>
              <UserCheck className="w-5 h-5" />
              <span className="font-semibold">10K+ Companies</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-slate-600 rounded-full"></div>
              <Users className="w-5 h-5" />
              <span className="font-semibold">100K+ Professionals</span>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white font-bold py-6 px-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-xl"
            >
              <span className="mr-3">Get Started</span>
              <ArrowRight className="w-6 h-6" />
            </Button>
            <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm">
              Join thousands of professionals advancing their careers
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/50 dark:border-slate-700/50 mt-20 transition-colors duration-300">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-slate-700 dark:from-blue-500 dark:to-slate-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">JobPortal Pro</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Professional career solutions for modern businesses
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-500 dark:text-slate-500">
              <span>© 2024 JobPortal Pro</span>
              <span>•</span>
              <span>Enterprise Solutions</span>
              <span>•</span>
              <span>Global Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
