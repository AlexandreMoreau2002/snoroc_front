// front/src/Router.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

// imports des composants
import { Header, Footer, PrivateRoute } from './components/export'

// Imports des pages admin
import { CreateNews } from './pages/admin/export.js'

// Imports des pages classiques
import {
  Home,
  Event,
  Media,
  About,
  Signup,
  Contact,
  Profile,
  LegalNotice,
  VerifyEmail,
  ResetPassword,
  ForgotPassword,
  TermsOfService,
} from './pages/visitor/export'

export default function Router() {
  return (
    <HelmetProvider>
      <BrowserRouter basename="/snoroc_front">
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
          <Route path="VerifyEmail" element={<VerifyEmail />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />

          {/* Error 404 */}
          <Route path="/*" element={<Navigate to="/home" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  )
}
