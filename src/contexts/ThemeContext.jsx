import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Dark theme only - no switching
const darkTheme = {
  name: 'dark',
  label: 'Errët',
  colors: {
    bg: '#0f172a',
    bgSecondary: '#1e293b',
    card: '#1e293b',
    cardBorder: '#334155',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#a855f7'
  }
};

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Always set dark theme
    document.documentElement.classList.remove('theme-light');
    document.documentElement.classList.add('theme-dark');
    
    // Set CSS variables for dark theme
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', darkTheme.colors.bg);
    root.style.setProperty('--bg-secondary', darkTheme.colors.bgSecondary);
    root.style.setProperty('--card-bg', darkTheme.colors.card);
    root.style.setProperty('--card-border', darkTheme.colors.cardBorder);
    root.style.setProperty('--text-primary', darkTheme.colors.text);
    root.style.setProperty('--text-secondary', darkTheme.colors.textSecondary);
    root.style.setProperty('--accent-primary', darkTheme.colors.accent);
    
    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', darkTheme.colors.bg);
    }
    
    // Remove any saved theme preference - always use dark
    localStorage.removeItem('theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      theme: 'dark', 
      themeConfig: darkTheme,
      isDark: true
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default values if context not available
    return { theme: 'dark', themeConfig: darkTheme, isDark: true };
  }
  return context;
}
