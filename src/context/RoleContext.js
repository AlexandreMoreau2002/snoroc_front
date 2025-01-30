// src/context/RoleContext.js
import React, { createContext, useState, useContext } from 'react'

export const RoleContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('blue')

  const toggleTheme = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.style.setProperty(
      '--role-color',
      newTheme === 'red' ? '#8b0000' : '#1b74e4'
    )
  }

  return (
    <RoleContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </RoleContext.Provider>
  )
}
export const useTheme = () => useContext(RoleContext)
