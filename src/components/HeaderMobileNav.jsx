// front/src/components/HeaderMobileNav.jsx
import { useEffect } from 'react'
import Logo from '../asset/Logo.webp'
import { Link, NavLink, useLocation } from 'react-router-dom'

export default function HeaderMobileNav({ links, isOpen, onToggle, onClose }) {
  const location = useLocation()

  useEffect(() => {
    onClose()
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const getLinkClassName = (isActive, aliases = []) =>
    isActive || aliases?.includes(location.pathname)
      ? 'header__nav__link header__nav__link--active'
      : 'header__nav__link'

  return (
    <div className="header__mobile">
      <button
        type="button"
        className={`header__toggle${isOpen ? ' header__toggle--close' : ''}`}
        onClick={onToggle}
      >
        <span className="header__toggle__bars">
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
            onClick={onClose}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Link
        to="/"
        className="header__logo-link header__logo-link--mobile"
        onClick={onClose}
      >
        <img src={Logo} alt="Logo" className="header__logo" />
      </Link>
    </div>
  )
}
