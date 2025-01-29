import './css/index.css'
import React from 'react'
import Router from './Router'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)
