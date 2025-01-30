// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react'
import { useTheme } from './RoleContext'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin || false)
  const { toggleTheme } = useTheme()

  useEffect(() => {
    toggleTheme(isAdmin ? 'red' : 'blue')
  }, [isAdmin, toggleTheme])

  const login = ({ accessToken, user }) => {
    setToken(accessToken)
    setUser(user)
    setIsAdmin(user.isAdmin)

    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAdmin(false)

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
