// front/src/Router.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

// Imports des composants
import {
  Home,
  Event,
  Media,
  About,
  Contact,
  Profile,
} from './pages/visitor/export'
import { CreateNews } from './pages/admin/export.js'
import PrivateRoute from './components/PrivateRoute'
import { LegalNotice, TermsOfService } from './pages/visitor/export'
import { Signup, ForgotPassword } from './pages/visitor/export'
import { Header, Footer } from './components/export'
import ResetPassword from './pages/visitor/ResetPassword.jsx'

export default function Router() {
  return (
    <HelmetProvider>
      {' '}
      {/* Ajouté */}
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/news" element={<Home />} />
          <Route element={<PrivateRoute />}>
            <Route path="/createNews" element={<CreateNews />} />
          </Route>

          {/* Event */}
          <Route path="/Event" element={<Event />} />

          {/* Media */}
          <Route path="/Media" element={<Media />} />

          {/* other */}
          <Route path="/A-propos" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Profil" element={<Profile />} />

          {/* footer nav */}
          <Route path="/Mentions-legales" element={<LegalNotice />} />
          <Route path="/CGU" element={<TermsOfService />} />

          {/* User */}
          <Route path="/Signup" element={<Signup />} />
          <Route path='/ResetPassword' element={<ResetPassword />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />

          {/* Error 404 */}
          <Route path="/*" element={<Navigate to="/home" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  )
}
