// src/components/Footer.jsx
import Logo from '../asset/Logo.webp'
import { Link, NavLink } from 'react-router-dom'
import { Helmet, HelmetProvider } from 'react-helmet-async'

export default function Footer() {
  return (
    <HelmetProvider>
      <footer className="footer">
        <Helmet>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
            integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </Helmet>
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
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a
            href="https://instagram.com"
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-instagram"></i>
          </a>
        </div>

        <Link to="/" className="footer__logo">
          <img src={Logo} alt="Logo Snoroc" />
        </Link>

        <div className="footer__right">
          <a
            href="https://twitter.com"
            className="footer__social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-twitter"></i>
          </a>
          <p className="footer__copyright-text">
            Copyright © 2023 Snoroc. Tous droits réservés. Tous les
            enregistrements musicaux sont protégés par le droit d'auteur.
          </p>
        </div>
      </footer>
    </HelmetProvider>
  )
}
