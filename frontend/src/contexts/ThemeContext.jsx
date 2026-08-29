import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme] = useState('dark')

  useEffect(() => {
    // Force a consistent dark theme across the entire app.
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }, [])

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => {}
  }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
