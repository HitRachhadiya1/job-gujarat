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
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 dark:from-blue-500 dark:to-slate-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
                JobPortal Pro
              </h1>
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
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    isActive(item.path) 
                      ? "bg-gradient-to-r from-blue-600 to-slate-700 text-white shadow-md" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3">
              {user?.picture && (
                <img 
                  src={user.picture} 
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600"
                />
              )}
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.name?.split(' ')[0] || 'User'}
                </div>
                {role && (
                  <Badge variant="secondary" className="text-xs">
                    {role.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Logout Button */}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden text-slate-600 dark:text-slate-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* User Info Mobile */}
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              {user?.picture && (
                <img 
                  src={user.picture} 
                  alt="User Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-600"
                />
              )}
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.name || 'User'}
                </div>
                {role && (
                  <Badge variant="secondary" className="text-xs">
                    {role.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Mobile Navigation Items */}
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start space-x-3 ${isActive(item.path) ? "bg-gradient-to-r from-blue-600 to-slate-700 text-white" : "text-slate-600 dark:text-slate-400"}`}
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
