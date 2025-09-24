import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthMeta } from "../context/AuthMetaContext";
import { useLogo } from "../context/LogoContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  LogOut,
  Home,
  Building2,
  Settings,
  User,
  Search,
  FileText,
  Heart,
  Target,
  BarChart3,
  Users,
  Menu,
  X,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import AppLogo from "./AppLogo";
import { resolveAssetUrl } from "@/config";

const Navbar = () => {
  const { logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { role } = useAuthMeta();
  const { appLogo } = useLogo();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({ name: "", logoUrl: "" });

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  // Fetch company basic info for COMPANY role to render logo/initial in Navbar
  useEffect(() => {
    let active = true;
    const fetchCompany = async () => {
      if (!isAuthenticated || role !== "COMPANY") return;
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }/api/company`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) return; // silent fail
        const data = await res.json();
        if (!active) return;
        setCompanyInfo({
          name: data?.name || "",
          logoUrl: data?.logoUrl || "",
        });
      } catch (e) {
        // ignore
      }
    };
    fetchCompany();
    return () => {
      active = false;
    };
  }, [isAuthenticated, role, getAccessTokenSilently]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavigationItems = () => {
    if (!isAuthenticated || !role) return [];

    if (role === "COMPANY") {
      return [
        { path: "/", label: "Dashboard", icon: Home },
        { path: "/jobs", label: "Job Management", icon: Briefcase },
        {
          path: "/company/applications",
          label: "Applications",
          icon: FileText,
        },
      ];
    }

    if (role === "JOB_SEEKER") {
      return [
        { path: "/", label: "Dashboard", icon: Home },
        { path: "/profile", label: "Profile", icon: User },
        { path: "/browse-jobs", label: "Browse Jobs", icon: Search },
        { path: "/applications", label: "My Applications", icon: FileText },
        { path: "/saved-jobs", label: "Saved Jobs", icon: Heart },
        { path: "/recommendations", label: "Recommendations", icon: Target },
      ];
    }

    if (role === "ADMIN") {
      return [
        { path: "/admin", label: "Admin Dashboard", icon: BarChart3 },
        { path: "/users", label: "Users", icon: Users },
      ];
    }

    return [];
  };

  // Show Navbar only where needed
  // - For JOB_SEEKER: hide on all routes (JobSeekerLayout provides its own unified header on all pages)
  // - For ADMIN: hide on admin pages ("/", "/admin", "/users") because AdminDashboard has its own header
  if (!isAuthenticated || !role) return null;
  if (role === "JOB_SEEKER") return null;
  if (
    role === "ADMIN" &&
    (location.pathname === "/" ||
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/users"))
  ) {
    return null;
  }

  const navigationItems = getNavigationItems();

  return (
    <nav className="h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-[#77BEE0]/40 dark:border-[#155AA4]/40 shadow-sm sticky top-0 z-50 transition-colors duration-500">
      <div className="container mx-auto px-4 h-20">
        <div className="h-full flex items-center justify-between">
          {/* Logo/Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <AppLogo size="w-11 h-11" rounded="rounded-xl" mode="contain" />
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Job Gujarat
              </h1>
              <p className="text-[11px] md:text-xs leading-tight text-stone-700 dark:text-stone-400 font-medium">
                Connecting you to What's Next
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`relative overflow-hidden flex items-center space-x-2 transition-all duration-200 font-medium rounded-xl ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-[#155AA4] to-[#0574EE] text-white shadow-md ring-1 ring-[#77BEE0]/40"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#77BEE0]/20 dark:hover:bg-white/10 hover:shadow-sm"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Company Avatar / Initial for COMPANY role, else user avatar */}
            <div className="hidden md:flex items-center">
              {role === "COMPANY" ? (
                companyInfo.logoUrl ? (
                  <img
                    src={resolveAssetUrl(companyInfo.logoUrl)}
                    alt="Company Logo"
                    className="w-9 h-9 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-white object-contain"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-br from-[#155AA4] to-[#0574EE] text-white flex items-center justify-center font-bold">
                    <span className="leading-none">
                      {(companyInfo.name || "C").charAt(0)}
                    </span>
                  </div>
                )
              ) : (
                user?.picture && (
                  <img
                    src={user.picture}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border-2 border-stone-400 dark:border-stone-600"
                  />
                )
              )}
            </div>

            {/* Animated Theme Toggle */}
            <AnimatedThemeToggler className="p-2 rounded-lg hover:bg-[#77BEE0]/20 dark:hover:bg-white/10 transition-colors" />

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-[#77BEE0] dark:border-[#155AA4] text-slate-700 dark:text-slate-300 hover:bg-[#77BEE0]/20 dark:hover:bg-white/10 font-medium rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-stone-600 dark:text-stone-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-[#77BEE0]/40 dark:border-[#155AA4]/40">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* Mobile Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-400 dark:border-stone-700">
              <div className="flex items-center space-x-3">
                {role === "COMPANY" ? (
                  companyInfo.logoUrl ? (
                    <img
                      src={resolveAssetUrl(companyInfo.logoUrl)}
                      alt="Company Logo"
                      className="w-10 h-10 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-white object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-gradient-to-br from-[#155AA4] to-[#0574EE] text-white flex items-center justify-center font-bold">
                      <span className="leading-none">
                        {(companyInfo.name || "C").charAt(0)}
                      </span>
                    </div>
                  )
                ) : (
                  user?.picture && (
                    <img
                      src={user.picture}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full border-2 border-stone-400 dark:border-stone-600"
                    />
                  )
                )}
              </div>
              <AnimatedThemeToggler className="p-2 rounded-lg hover:bg-[#77BEE0]/20 dark:hover:bg-white/10 transition-colors" />
            </div>

            {/* Mobile Navigation Items */}
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`relative w-full justify-start space-x-3 font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-[#155AA4] to-[#0574EE] text-white ring-1 ring-[#77BEE0]/40"
                      : "text-slate-700 dark:text-slate-300 hover:bg-[#77BEE0]/20 dark:hover:bg-white/10"
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
