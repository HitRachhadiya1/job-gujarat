import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Read persisted theme (default to light). Also migrate from legacy 'theme' key if present.
    const legacy = localStorage.getItem("theme");
    const saved = localStorage.getItem("job-gujarat-theme") || legacy;
    if (saved && (saved === "light" || saved === "dark")) {
      setTheme(saved);
      // Migrate to unified key
      localStorage.setItem("job-gujarat-theme", saved);
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("job-gujarat-theme", theme);

    // Also apply dark class for Tailwind CSS
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
