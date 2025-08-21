import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ variant = "outline", size = "sm", className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      onClick={toggleTheme}
      variant={variant}
      size={size}
      className={`border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
    </Button>
  );
};

export default ThemeToggle;
