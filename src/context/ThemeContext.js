import React, { createContext, useState } from 'react'

export const ThemeContext = createContext()
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('blue')

  const toggleTheme = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.style.setProperty(
      '--main-color',
      newTheme === 'red' ? '#8b0000' : '#1b74e4'
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
