import './css/index.css'
import React from 'react'
import Router from './Router'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </React.StrictMode>
)
