import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useJobSeekerProfile } from "@/hooks/useJobSeekerProfile";
import {
  Home,
  Briefcase,
  FileText,
  Heart,
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Grid3X3,
  TrendingUp,
  Target,
  Award,
  Sparkles,
} from "lucide-react";
import AppLogo from "./AppLogo";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function JobSeekerLayout({
  children,
  activeView,
  onNavigate,
  onLogout,
}) {
  const { user } = useAuth0();
  const { profilePhoto } = useJobSeekerProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navigation items
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Grid3X3 },
    { id: "browse-jobs", label: "Browse Jobs", icon: Search },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "saved-jobs", label: "Saved", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Modern Top Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl border-b border-slate-200/50 dark:border-slate-700/50"
            : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md"
        )}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo and Brand */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <AppLogo
                size="w-8 h-8 sm:w-10 sm:h-10"
                rounded="rounded-xl"
                mode="contain"
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "px-3 lg:px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 text-sm lg:text-base",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>

            {/* Tablet Navigation - Icon Only */}
            <nav className="hidden md:flex lg:hidden items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "p-2 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {/* Notifications - Hidden on small screens */}
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button> */}

              {/* Theme Toggle */}
              <div className="hidden sm:block">
                <AnimatedThemeToggler className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={
                          profilePhoto ||
                          user?.picture ||
                          `https://ui-avatars.com/api/?name=${
                            user?.name || "User"
                          }&background=6366f1&color=fff`
                        }
                        alt="Profile"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border-2 border-gradient-to-r from-blue-600 to-purple-600"
                      />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </div>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-400 hidden sm:block" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate("profile")}>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("dashboard")}>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-3 sm:py-4 border-t border-slate-200 dark:border-slate-700"
              >
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 mb-1.5 sm:mb-2 text-sm sm:text-base",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}

                {/* Mobile-only actions */}
                <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {/* Theme Toggle for Mobile */}
                  <AnimatedThemeToggler className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />

                  {/* Notifications for Mobile */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </motion.button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 min-h-screen">{children}</main>
    </div>
  );
}
