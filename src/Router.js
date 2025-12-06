// front/src/Router.js
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// imports des composants
import { useLoading } from './context/LoadingContext'
import { Header, Footer, PrivateRoute, Loader } from './components/export'

// Imports des pages admin
import { CreateEvent, CreateNews, EditAbout } from './pages/admin/export.js'

// Imports des pages classiques
import {
  Home,
  Event,
  Media,
  About,
  Signup,
  Contact,
  Profile,
  AllActus,
  ActuDetails,
  AllEvents,
  EventDetails,
  LegalNotice,
  VerifyEmail,
  ResetPassword,
  ForgotPassword,
  TermsOfService,
} from './pages/visitor/export'

export default function Router() {
  const { isLoading } = useLoading()
  const showLoader = isLoading

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Header />
        {/* <div className="debug-center-line" /> */}
        <main className={`app-loading ${showLoader ? 'app-loading--active' : ''}`}>
          {showLoader && <Loader />}
          <div className="app-loading__content">
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/news" element={<Home />} />
              <Route path="/actus/all" element={<AllActus />} />
              <Route path="/actus/:id" element={<ActuDetails />} />
              <Route path="/news/id/:id" element={<ActuDetails />} />
              <Route element={<PrivateRoute />}>
                <Route path="/createNews" element={<CreateNews />} />
                <Route path="/admin/actus/edit/:id" element={<CreateNews />} />
                <Route path="/admin/about/edit" element={<EditAbout />} />
                <Route path="/createEvent" element={<CreateEvent />} />
                <Route path="/admin/events/edit/:id" element={<CreateEvent />} />
              </Route>

              {/* Event */}
              <Route path="/Events/all" element={<AllEvents />} />
              <Route path="/Events/:id" element={<EventDetails />} />
              <Route path="/event" element={<Event />} />
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
          </div>
        </main>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  )
}
