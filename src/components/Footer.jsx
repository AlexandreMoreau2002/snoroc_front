// src/components/Footer.jsx
import Logo from '../asset/Logo.webp'
import { Link, NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
        <div className="footer__left">
          <NavLink to="/Mentions-legales" className="footer__link">
            Mentions légales
          </NavLink>
          <NavLink to="/CGU" className="footer__link">
            CGU
          </NavLink>
          <a
            href="https://facebook.com"
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-facebook" aria-hidden="true"></i>
            <span className="footer__social-label">Facebook</span>
          </a>
          <a
            href="https://instagram.com"
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-instagram" aria-hidden="true"></i>
            <span className="footer__social-label">Instagram</span>
          </a>
          <a
            href="https://twitter.com"
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-twitter" aria-hidden="true"></i>
            <span className="footer__social-label">Twitter</span>
          </a>
        </div>

        <Link to="/" className="footer__logo">
          <img src={Logo} alt="Logo Snoroc" />
        </Link>

        <div className="footer__right">
          <p className="footer__copyright-text">
            Copyright © 2023 Snoroc. Tous droits réservés. Tous les
            enregistrements musicaux sont protégés par le droit d'auteur.
          </p>
        </div>
      </footer>
  )
}
