import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  Building2, 
  ArrowRight, 
  Briefcase, 
  TrendingUp, 
  UserCheck, 
  Award, 
  Globe, 
  Moon, 
  Sun,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Target,
  Search,
  Heart,
  Sparkles,
  Clock,
  Brain,
  Rocket,
  Lock,
  Eye,
  Filter
} from "lucide-react"

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

  const features = [
    {
      icon: Brain,
      title: "Intelligent Matching",
      description: "Advanced algorithms analyze your profile to connect you with positions that align with your career goals and expertise."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and rigorous verification processes ensure your data remains protected and confidential."
    },
    {
      icon: Rocket,
      title: "Accelerated Process",
      description: "Streamlined application workflows and direct employer connections reduce time-to-hire by up to 60%."
    },
    {
      icon: Eye,
      title: "Market Intelligence",
      description: "Real-time salary insights, industry trends, and competitive analysis to inform your career decisions."
    }
  ]

  const highlights = [
    {
      icon: Sparkles,
      title: "Premium Experience",
      description: "Curated job opportunities from leading companies across Gujarat's thriving business ecosystem."
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Instant notifications for new matches, application status changes, and interview invitations."
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      description: "Sophisticated search parameters including salary range, work culture, and growth potential."
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Complete control over your profile visibility with anonymous browsing and selective disclosure options."
    }
  ]

  return (
    <div className="min-h-screen bg-stone-300 dark:bg-stone-950 relative overflow-hidden transition-colors duration-500">
      {/* Subtle matte background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-stone-400/20 dark:bg-stone-800/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-500/15 dark:bg-stone-700/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-stone-400/25 dark:bg-stone-800/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-stone-800 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-700 dark:border-stone-800/50 shadow-lg">
        <div className="container mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-200 dark:to-stone-100 rounded-3xl flex items-center justify-center shadow-xl border border-stone-200/20">
                <Briefcase className="w-7 h-7 text-stone-800 dark:text-stone-800" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-stone-100 dark:text-stone-100 tracking-tight">
                  Job Gujarat
                </h1>
                <p className="text-sm text-stone-300 dark:text-stone-400 font-medium tracking-wide">Elite Career Solutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="sm"
                className="text-stone-300 dark:text-stone-400 hover:text-stone-100 dark:hover:text-stone-100 hover:bg-stone-700/50 dark:hover:bg-stone-800/50 rounded-xl p-3 transition-all duration-300"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-stone-900 dark:text-stone-100 leading-tight mb-4 tracking-tight">
              Elite Career
              <span className="block text-stone-600 dark:text-stone-400 font-light">Connections</span>
            </h2>
          </div>

          {/* Primary CTA at top, directly under headline */}
          <div className="max-w-md mx-auto mb-8">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-semibold py-5 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="mr-3">Begin Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-2xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light tracking-wide">
            Where exceptional talent meets extraordinary opportunities. Experience the future of professional networking in Gujarat's premier career ecosystem.
          </p>

          {/* Highlights Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {highlights.map((highlight, index) => (
              <Card key={index} className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 shadow-lg hover:shadow-xl transition-all duration-500 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-stone-300/80 dark:bg-stone-800 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <highlight.icon className="w-8 h-8 text-stone-900 dark:text-stone-300" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">{highlight.title}</h3>
                  <p className="text-stone-800 dark:text-stone-400 leading-relaxed font-light text-sm">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-6 tracking-tight">
              Enterprise-Grade Solutions
            </h3>
            <p className="text-xl text-stone-800 dark:text-stone-400 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
              Sophisticated technology and premium services designed for discerning professionals who demand excellence in their career advancement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-stone-100/95 dark:bg-stone-900/60 backdrop-blur-sm border-stone-400/70 dark:border-stone-800/50 hover:bg-stone-50/98 dark:hover:bg-stone-900/80 transition-all duration-500 shadow-xl hover:shadow-2xl group">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-stone-300/90 to-stone-400/70 dark:from-stone-800 dark:to-stone-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <feature.icon className="w-10 h-10 text-stone-900 dark:text-stone-300" />
                  </div>
                  <h4 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
                    {feature.title}
                  </h4>
                  <p className="text-stone-800 dark:text-stone-400 leading-relaxed font-light text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-stone-200/90 dark:bg-stone-900/80 backdrop-blur-md border-t border-stone-400/50 dark:border-stone-800/50 mt-20">
        <div className="container mx-auto px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-stone-800 to-stone-900 dark:from-stone-200 dark:to-stone-100 rounded-3xl flex items-center justify-center shadow-xl">
                <Briefcase className="w-7 h-7 text-white dark:text-stone-800" />
              </div>
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Job Gujarat</span>
            </div>
            <p className="text-stone-800 dark:text-stone-400 mb-8 font-medium text-lg tracking-wide">
              Elite Career Solutions
            </p>
            <div className="flex items-center justify-center space-x-12 text-base text-stone-700 dark:text-stone-500 font-medium tracking-wide">
              <span>© 2025 Job Gujarat</span>
              <span>•</span>
              <span>Executive Privacy</span>
              <span>•</span>
              <span>Premium Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
