import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react";
import { useLogo } from "../context/LogoContext";
import AppLogo from "./AppLogo";
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
  Filter,
  Linkedin,
  Twitter,
  Instagram,
  Facebook
} from "lucide-react"

export default function PublicRoutes({ onGetStarted }) {
  const { loginWithRedirect } = useAuth0();
  const { appLogo } = useLogo();
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
      icon: Search,
      title: "Browse & Apply",
      description: "Search jobs and submit applications with your resume."
    },
    {
      icon: UserCheck,
      title: "Profile & Resume Upload",
      description: "Create your profile, upload resume and photo securely."
    },
    {
      icon: Shield,
      title: "Aadhaar Documents",
      description: "Upload Aadhaar after hire to complete the approval process."
    },
    {
      icon: Zap,
      title: "Razorpay Payments",
      description: "Secure approval fee payments integrated with Razorpay."
    }
  ]

  const highlights = [
    {
      icon: Building2,
      title: "Company Job Posting",
      description: "Post jobs and manage applicants from a unified dashboard."
    },
    {
      icon: TrendingUp,
      title: "Application Tracking",
      description: "Track your applications and statuses in one place."
    },
    {
      icon: CheckCircle,
      title: "Admin Verified",
      description: "Verified companies and moderated listings."
    },
    {
      icon: Lock,
      title: "Secure Login",
      description: "Auth0 authentication with role-based access."
    }
  ]

  return (
    <div className="min-h-screen bg-[#EAF6F9] dark:bg-[#0B1F3B] relative overflow-hidden transition-colors duration-500">
      {/* Subtle background accents with brand colors */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#77BEE0]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0574EE]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0B1F3B]/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-[#0B1F3B]/90 backdrop-blur-md border-b border-[#77BEE0]/40 shadow-lg">
        <div className="container mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <AppLogo size="w-14 h-14" rounded="rounded-3xl" mode="contain" className="shadow-xl border border-[#77BEE0]/30" />
              <div>
                <h1 className="text-3xl font-bold text-[#155AA4] dark:text-white tracking-tight">
                  Job Gujarat
                </h1>
                <p className="inline-block px-3 py-1 rounded-full bg-[#77BEE0]/20 text-[#155AA4]/90 dark:bg-white/10 dark:text-[#EAF6F9]/90 text-xs font-semibold tracking-wider">ગુજરાતની કારકિર્દીનો હબ</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="sm"
                className="text-[#155AA4] dark:text-[#EAF6F9] hover:text-[#0574EE] dark:hover:text-white hover:bg-[#77BEE0]/20 dark:hover:bg-white/10 rounded-xl p-3 transition-all duration-300"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="container mx-auto px-8 py-10">
          <div className="max-w-5xl mx-auto text-center min-h-[40vh] flex flex-col items-center justify-center">
            <div className="mb-2">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-[#155AA4] dark:text-white leading-tight tracking-tight">
                Elite Career
                <span className="block text-[#0574EE] dark:text-[#77BEE0] font-light text-6xl md:text-7xl lg:text-8xl">Connections</span>
              </h2>
            </div>

            {/* Primary CTA centered mid-screen */}
            <div className="max-w-md w-full mx-auto mt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="w-full bg-gradient-to-r from-[#155AA4] to-[#0574EE] hover:from-[#155AA4] hover:to-[#0574EE]/90 text-white font-semibold py-5 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="mr-3">Begin Your Journey</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <p className="mt-8 mb-10 text-xl md:text-2xl text-[#155AA4]/80 dark:text-[#EAF6F9]/90 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              Where exceptional talent meets extraordinary opportunities in Gujarat's premier career ecosystem.
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {highlights.map((highlight, index) => (
              <Card key={index} className="bg-white/90 dark:bg-[#0B1F3B]/50 backdrop-blur-sm border border-[#77BEE0]/40 shadow-lg hover:shadow-xl hover:border-[#0574EE]/60 transition-all duration-500 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#EAF6F9] dark:bg-[#77BEE0]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <highlight.icon className="w-8 h-8 text-[#155AA4] dark:text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#155AA4] dark:text-white mb-2 tracking-tight">{highlight.title}</h3>
                  <p className="text-[#155AA4]/80 dark:text-[#EAF6F9]/90 leading-relaxed font-light text-sm">{highlight.description}</p>
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
            <h3 className="text-4xl md:text-5xl font-bold text-[#155AA4] dark:text-white mb-6 tracking-tight">
              Enterprise-Grade Solutions
            </h3>
            <p className="text-xl text-[#155AA4]/80 dark:text-[#EAF6F9]/90 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
              Sophisticated technology and premium services designed for discerning professionals who demand excellence in their career advancement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/90 dark:bg-[#0B1F3B]/50 backdrop-blur-sm border border-[#77BEE0]/40 hover:border-[#0574EE]/60 transition-all duration-500 shadow-xl hover:shadow-2xl group">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#77BEE0]/40 to-[#EAF6F9] dark:from-[#77BEE0]/20 dark:to-[#0574EE]/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <feature.icon className="w-10 h-10 text-[#155AA4] dark:text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-[#155AA4] dark:text-white mb-3 tracking-tight">
                    {feature.title}
                  </h4>
                  <p className="text-[#155AA4]/80 dark:text-[#EAF6F9]/90 leading-relaxed font-light text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 dark:bg-[#0B1F3B]/90 backdrop-blur-md border-t border-[#77BEE0]/40 mt-20">
        <div className="container mx-auto px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <AppLogo size="w-12 h-12" rounded="rounded-2xl" mode="contain" className="shadow-xl" />
                <span className="text-xl font-bold text-[#155AA4] dark:text-white tracking-tight">Job Gujarat</span>
              </div>
              <p className="text-sm text-[#155AA4]/80 dark:text-[#EAF6F9]/80">ગુજરાતની કારકિર્દીનો હબ</p>
            </div>

            {/* Social icons */}
            <div className="flex flex-col">
              <h5 className="text-sm font-semibold text-[#155AA4] dark:text-white tracking-wider mb-2">Connect</h5>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#77BEE0]/20 text-[#155AA4] dark:text-white dark:bg-white/10" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div className="p-2 rounded-xl bg-[#77BEE0]/20 text-[#155AA4] dark:text-white dark:bg-white/10" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </div>
                <div className="p-2 rounded-xl bg-[#77BEE0]/20 text-[#155AA4] dark:text-white dark:bg-white/10" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="p-2 rounded-xl bg-[#77BEE0]/20 text-[#155AA4] dark:text-white dark:bg-white/10" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </div>
              </div>
            </div>

            
          </div>

          <div className="mt-8 pt-4 border-t border-[#77BEE0]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#155AA4]/80 dark:text-[#EAF6F9]/70">
            <span>© 2025 Job Gujarat</span>
            <div className="mt-2 sm:mt-0 flex items-center space-x-4">
              <span>Made in Gujarat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}