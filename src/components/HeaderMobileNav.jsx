// front/src/components/HeaderMobileNav.jsx
import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from '../asset/Logo.webp'

export default function HeaderMobileNav({ links }) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const getLinkClassName = (isActive, aliases = []) =>
    isActive || aliases?.includes(location.pathname)
      ? 'header__nav__link header__nav__link--active'
      : 'header__nav__link'

  const handleToggle = () => setIsOpen((prev) => !prev)
  const handleClose = () => setIsOpen(false)

  return (
    <div className="header__mobile">
      <button
        type="button"
        className={`header__toggle${isOpen ? ' header__toggle--close' : ''}`}
        aria-label={isOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'}
        aria-controls="header-drawer"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <span className="header__toggle__bars" aria-hidden="true">
          <span className="header__toggle__bar" />
          <span className="header__toggle__bar" />
          <span className="header__toggle__bar" />
        </span>
      </button>

      <nav
        id="header-drawer"
        className={`header__nav header__nav--drawer${isOpen ? ' header__nav--drawer-open' : ''}`}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              getLinkClassName(isActive, link.aliases)
            }
            onClick={handleClose}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/"
        className="header__logo-link header__logo-link--mobile"
        onClick={handleClose}
      >
        <img src={Logo} alt="Logo" className="header__logo" />
      </Link>
    </div>
  )
}
