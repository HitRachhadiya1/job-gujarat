import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthMeta } from '../context/AuthMetaContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth0();
  const { role } = useAuthMeta();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavigationItems = () => {
    if (!isAuthenticated || !role) return [];

    if (role === 'COMPANY') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '🏢' },
        { path: '/jobs', label: 'Job Management', icon: '💼' },
        { path: '/applications', label: 'Applications', icon: '📋' },
        { path: '/company-setup', label: 'Company Settings', icon: '⚙️' },
        { path: '/analytics', label: 'Analytics', icon: '📊' }
      ];
    }

    if (role === 'JOB_SEEKER') {
      return [
        { path: '/profile', label: 'Profile', icon: '👤' },
        { path: '/browse-jobs', label: 'Browse Jobs', icon: '🔍' },
        { path: '/applications', label: 'My Applications', icon: '📄' },
        { path: '/saved-jobs', label: 'Saved Jobs', icon: '❤️' },
        { path: '/recommendations', label: 'Recommendations', icon: '🎯' }
      ];
    }

    return [];
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar for unauthenticated users
  }

  const navigationItems = getNavigationItems();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <span className="brand-icon">💼</span>
          <span className="brand-text">JobPortal</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop-menu">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <div className="user-info">
            <img 
              src={user?.picture || '/default-avatar.png'} 
              alt="User Avatar" 
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{role?.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="user-dropdown">
            <button className="dropdown-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ⚙️
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/settings')} className="dropdown-item">
                  Settings
                </button>
                <button onClick={() => navigate('/help')} className="dropdown-item">
                  Help & Support
                </button>
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          <hr className="mobile-divider" />
          <button onClick={() => navigate('/settings')} className="mobile-nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </button>
          <button onClick={handleLogout} className="mobile-nav-item logout">
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: #ffffff;
          border-bottom: 1px solid #e5e5e5;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          height: 64px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-weight: bold;
          font-size: 1.25rem;
          color: #333;
          transition: color 0.2s;
        }

        .navbar-brand:hover {
          color: #007bff;
        }

        .brand-icon {
          margin-right: 0.5rem;
          font-size: 1.5rem;
        }

        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
          text-decoration: none;
        }

        .nav-item:hover {
          background-color: #f8f9fa;
          color: #007bff;
        }

        .nav-item.active {
          background-color: #007bff;
          color: white;
        }

        .nav-icon {
          margin-right: 0.5rem;
          font-size: 1rem;
        }

        .nav-label {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e5e5e5;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
        }

        .user-role {
          font-size: 0.75rem;
          color: #666;
          text-transform: capitalize;
        }

        .user-dropdown {
          position: relative;
        }

        .dropdown-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .dropdown-toggle:hover {
          background-color: #f8f9fa;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 160px;
          z-index: 1001;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 0.9rem;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
        }

        .dropdown-item.logout {
          color: #dc3545;
        }

        .dropdown-item.logout:hover {
          background-color: #f8f9fa;
          color: #c82333;
        }

        .dropdown-divider {
          border: none;
          border-top: 1px solid #e5e5e5;
          margin: 0;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-menu {
          display: none;
          background: white;
          border-top: 1px solid #e5e5e5;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 1rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid #f5f5f5;
        }

        .mobile-nav-item:hover {
          background-color: #f8f9fa;
        }

        .mobile-nav-item.active {
          background-color: #e3f2fd;
          color: #007bff;
        }

        .mobile-nav-item.logout {
          color: #dc3545;
        }

        .mobile-divider {
          border: none;
          border-top: 1px solid #e5e5e5;
          margin: 0;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }

          .user-details {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-menu {
            display: block;
          }
        }

        @media (max-width: 480px) {
          .navbar-container {
            padding: 0 0.75rem;
          }

          .brand-text {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
