import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthMeta } from '../context/AuthMetaContext';
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
  X
} from "lucide-react";
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { logout, user, isAuthenticated } = useAuth0();
  const { role } = useAuthMeta();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavigationItems = () => {
    if (!isAuthenticated || !role) return [];

    if (role === 'COMPANY') {
      return [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/jobs', label: 'Job Management', icon: Briefcase },
        { path: '/company-setup', label: 'Company Settings', icon: Settings }
      ];
    }

    if (role === 'JOB_SEEKER') {
      return [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/browse-jobs', label: 'Browse Jobs', icon: Search },
        { path: '/applications', label: 'My Applications', icon: FileText },
        { path: '/saved-jobs', label: 'Saved Jobs', icon: Heart },
        { path: '/recommendations', label: 'Recommendations', icon: Target }
      ];
    }

    if (role === 'ADMIN') {
      return [
        { path: '/admin', label: 'Admin Dashboard', icon: BarChart3 },
        { path: '/users', label: 'Users', icon: Users }
      ];
    }

    return [];
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar for unauthenticated users
  }

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/80 to-slate-50/50 dark:from-slate-900/50 dark:via-slate-900/80 dark:to-slate-900/50"></div>
      <div className="relative container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div 
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-slate-600/20 to-slate-900/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                Job Gujarat
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">Connecting you to What's Next</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 group ${
                    isActive(item.path) 
                      ? "bg-slate-900/10 dark:bg-slate-100/10 text-slate-900 dark:text-slate-100 shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/5 to-slate-800/5 dark:from-slate-100/5 dark:to-slate-200/5 rounded-lg"></div>
                  )}
                  <IconComponent className={`w-4 h-4 transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-sm font-medium relative z-10">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                  )}
                </Button>
              );
            })}
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl px-4 py-2 border border-slate-200/50 dark:border-slate-700/50">
              {user?.picture && (
                <div className="relative">
                  <img 
                    src={user.picture} 
                    alt="User Avatar" 
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                </div>
              )}
              <div className="text-right space-y-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name?.split(' ')[0] || 'User'}
                </div>
                {role && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 border-0 font-medium">
                    {role.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Theme Toggle */}
            <div className="p-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <ThemeToggle />
            </div>
            
            {/* Logout Button */}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="relative border-slate-300/60 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-50/0 via-red-50/20 to-red-50/0 dark:from-red-900/0 dark:via-red-900/10 dark:to-red-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <LogOut className="w-4 h-4 md:mr-2 relative z-10 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
              <span className="hidden md:inline relative z-10 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">Logout</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 to-white/50 dark:from-slate-900/30 dark:to-slate-900/50"></div>
          <div className="relative container mx-auto px-6 py-6 space-y-4">
            {/* User Info Mobile */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center space-x-4">
                {user?.picture && (
                  <div className="relative">
                    <img 
                      src={user.picture} 
                      alt="User Avatar" 
                      className="w-12 h-12 rounded-full border-3 border-white dark:border-slate-700 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || 'User'}
                  </div>
                  {role && (
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 border-0 font-medium">
                      {role.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                <ThemeToggle />
              </div>
            </div>
            
            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start space-x-4 py-3 px-4 rounded-xl transition-all duration-300 group ${
                      isActive(item.path) 
                        ? "bg-slate-900/10 dark:bg-slate-100/10 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                  >
                    <IconComponent className={`w-5 h-5 transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.path) && (
                      <div className="ml-auto w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
