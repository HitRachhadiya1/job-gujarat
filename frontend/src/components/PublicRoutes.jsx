import { useState, useEffect, useRef } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useLogo } from "../context/LogoContext";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

import AppLogo from "./AppLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
  MapPin,
  DollarSign,
  Clock,
  Search,
  Filter,
  BookOpen,
  Mail,
  Phone,
  Lock,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Sparkles,
  BarChart3,
  MousePointerClick,
  Menu,
  X,
  ChevronRight,
  ArrowUpRight,
  Code2,
  Palette,
  Cpu,
  Database,
  MessageSquare,
  FileText,
  Github,
  Layers,
} from "lucide-react";

export default function PublicRoutes({ onGetStarted }) {
  const { loginWithRedirect } = useAuth0();
  const { logo } = useLogo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Animation variants
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Counter animation state
  const [counters, setCounters] = useState({
    jobs: 0,
    companies: 0,
    seekers: 0,
    placements: 0,
  });

  const { ref: statsRef, inView: statsInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (statsInView) {
      // Animate counters
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setCounters({
          jobs: Math.floor(12450 * progress),
          companies: Math.floor(850 * progress),
          seekers: Math.floor(45000 * progress),
          placements: Math.floor(8900 * progress),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [statsInView]);

  const handleGetStarted = () => {
    loginWithRedirect();
  };

  const features = [
    {
      icon: Search,
      title: "Smart Job Matching",
      description:
        "AI-powered recommendations that match your skills with the perfect opportunities",
      color: "from-blue-500 to-cyan-500",
      size: "large",
    },
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "Aadhaar verification ensures authentic candidates",
      color: "from-purple-500 to-pink-500",
      size: "small",
    },
    {
      icon: Zap,
      title: "Instant Applications",
      description: "One-click apply with saved profiles",
      color: "from-orange-500 to-red-500",
      size: "small",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Track application status, view count, and company responses instantly",
      color: "from-green-500 to-emerald-500",
      size: "medium",
    },
    {
      icon: Globe,
      title: "Gujarat Focused",
      description: "Exclusive opportunities from top companies",
      color: "from-indigo-500 to-blue-500",
      size: "small",
    },
    {
      icon: Building2,
      title: "500+ Companies",
      description: "Partner with industry leaders",
      color: "from-yellow-500 to-orange-500",
      size: "small",
    },
  ];

  const highlights = [
    {
      icon: Building2,
      title: "Company Job Posting",
      description: "Post jobs and manage applicants from a unified dashboard.",
    },
    {
      icon: TrendingUp,
      title: "Application Tracking",
      description: "Track your applications and statuses in one place.",
    },
    {
      icon: CheckCircle,
      title: "Admin Verified",
      description: "Verified companies and moderated listings.",
    },
    {
      icon: Lock,
      title: "Secure Login",
      description: "Auth0 authentication with role-based access.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform-origin-0 z-50"
        style={{ scaleX }}
      />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[size:50px_50px]" />

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-conic from-purple-400 via-pink-500 to-blue-500 rounded-full filter blur-3xl opacity-20 animate-spin-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-conic from-green-400 via-blue-500 to-purple-500 rounded-full filter blur-3xl opacity-20 animate-spin-slow animation-delay-4000" />

        {/* Background ripple with spotlight disabled (no cursor shine), click ripple enabled */}
        <BackgroundRippleEffect enableSpotlight={false} enableRipple={true} />
      </div>

      {/* Modern Glassmorphism Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50 z-40"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <AppLogo
                size="w-11 h-11"
                rounded="rounded-xl"
                mode="contain"
                className="relative"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                  Job Gujarat
                </h1>
                <p className="text-[11px] md:text-xs leading-tight text-stone-700 dark:text-stone-400 font-medium">
                  Connecting you to What's Next
                </p>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#stats"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                Statistics
              </a>
              <a
                href="#process"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                How it Works
              </a>
              <AnimatedThemeToggler className="p-2 rounded-lg hover:bg-[#77BEE0]/20 dark:hover:bg-white/10 transition-colors" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium text-sm hover:shadow-lg transition-shadow"
              >
                Get Started
              </motion.button>
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-700 dark:text-slate-300"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Floating Badge */}
            {/* <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-8"
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Gujarat's #1 Job Portal
              </span>
            </motion.div> */}

            {/* Main Headline */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Find Your Dream Job
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">
                Build Your Career
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
            >
              Connect with top companies, apply instantly, and track your
              applications in real-time. Your next opportunity is just a click
              away.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium text-lg hover:shadow-xl transition-shadow flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full font-medium text-lg hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700"
              >
                Hire Talent
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Animated Statistics Section */}
      <section
        id="stats"
        className="relative py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800"
      >
        <div className="container mx-auto px-6" ref={statsRef}>
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeUpVariants} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {counters.jobs.toLocaleString()}+
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Active Jobs
              </p>
            </motion.div>
            <motion.div variants={fadeUpVariants} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {counters.companies.toLocaleString()}+
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Companies
              </p>
            </motion.div>
            <motion.div variants={fadeUpVariants} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                {counters.seekers.toLocaleString()}+
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Job Seekers
              </p>
            </motion.div>
            <motion.div variants={fadeUpVariants} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {counters.placements.toLocaleString()}+
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Successful Placements
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Modern Bento Grid Features */}
      <section id="features" className="relative py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features to accelerate your job search and hiring process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Large featured card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className={cn(
                "md:col-span-2 md:row-span-1",
                "group relative overflow-hidden rounded-3xl p-8",
                "bg-gradient-to-br from-blue-500 to-purple-600",
                "hover:scale-[1.02] transition-all duration-300"
              )}
            >
              <div className="relative z-10">
                <Search className="w-12 h-12 text-white/90 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  All types of Job
                </h3>
                <p className="text-white/80 text-lg">
                  Jobs from all types of industries that match your skills with
                  the perfect opportunities. Get hired in company with right
                  skills.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            </motion.div>

            {/* Smaller cards */}
            {features.slice(1, 4).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl p-6",
                  "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                  "hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl mb-4 flex items-center justify-center",
                    "bg-gradient-to-br",
                    feature.color
                  )}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}

            {/* Bottom cards */}
            {features.slice(4).map((feature, index) => (
              <motion.div
                key={index + 4}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 4) * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl p-6",
                  "bg-gradient-to-br",
                  feature.color,
                  "hover:scale-[1.02] transition-all duration-300"
                )}
              >
                <feature.icon className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="process"
        className="relative py-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get started with your job search in 4 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                number: "01",
                title: "Create Profile",
                description: "Sign up and build your professional profile",
                icon: UserCheck,
              },
              {
                number: "02",
                title: "Browse Jobs",
                description: "Explore opportunities matching your skills",
                icon: Search,
              },
              {
                number: "03",
                title: "Apply Instantly",
                description: "Submit applications with one click",
                icon: MousePointerClick,
              },
              {
                number: "04",
                title: "Get Hired",
                description: "Interview and land your dream job",
                icon: Briefcase,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                )}

                <div className="text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-1 mb-4">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-blue-600 mb-2">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative bg-slate-900 dark:bg-black mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto px-6 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
                  <AppLogo
                    size="w-10 h-10"
                    rounded="rounded-xl"
                    mode="contain"
                    className="relative"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Job Gujarat
                </span>
              </div>
              <p className="text-slate-400 mb-4">
                Your trusted partner in building careers and finding talent
                across Gujarat.
              </p>
              <div className="flex space-x-3">
                {[
                  { icon: Github, href: "#" },
                  { icon: Linkedin, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Instagram, href: "#" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {["About Us", "Careers", "Blog", "Contact"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {[
                  "Help Center",
                  "Privacy Policy",
                  "Terms of Service",
                  "FAQ",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                2025 Job Gujarat. All rights reserved.
              </p>
              <p className="text-slate-400 text-sm mt-4 md:mt-0">
                Made in Gujarat
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}