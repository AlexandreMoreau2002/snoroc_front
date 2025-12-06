// front/src/components/Header.jsx
import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from '../asset/Logo.webp'
import HeaderMobileNav from './HeaderMobileNav'

const NAV_LINKS = [
  {
    label: 'Actus',
    to: '/',
    aliases: ['/home', '/news'],
  },
  {
    label: 'Event',
    to: '/event',
    aliases: ['/Event', '/events/all', '/events'],
  },
  { label: 'Média', to: '/Media' },
  { label: 'A propos', to: '/A-propos' },
  { label: 'Contact', to: '/Contact' },
  { label: 'Profil', to: '/Profil' },
]

export default function Header() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const getLinkClassName = (isActive, aliases = []) =>
    isActive || aliases?.includes(location.pathname)
      ? 'header__nav__link header__nav__link--active'
      : 'header__nav__link'

  const renderNavLinks = (links) =>
    links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className={({ isActive }) => getLinkClassName(isActive, link.aliases)}
      >
        {link.label}
      </NavLink>
    ))

  return (
    <header className={`header${isMobileMenuOpen ? ' header--open' : ''}`}>
      <div className="header__desktop">
        <nav className="header__nav header__nav--desktop header__nav--left">
          {renderNavLinks(NAV_LINKS.slice(0, 3))}
        </nav>

        <Link to="/" className="header__logo-link header__logo-link--desktop">
          <img src={Logo} alt="Logo" className="header__logo" />
        </Link>

        <nav className="header__nav header__nav--desktop header__nav--right">
          {renderNavLinks(NAV_LINKS.slice(3))}
        </nav>
      </div>

      <HeaderMobileNav 
        links={NAV_LINKS} 
        isOpen={isMobileMenuOpen} 
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  )
}
