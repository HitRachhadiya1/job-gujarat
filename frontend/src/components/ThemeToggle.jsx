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
      className={`border-stone-400/70 dark:border-stone-600 text-stone-800 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/30 transition-all duration-200 ${className}`}
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
