// src/components/login.jsx
import { Link } from 'react-router-dom'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import postLogin from '../services/user/postLogin'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = await postLogin(email, password)
      login(token)
      console.log('Connexion réussie')
    } catch (error) {
      setErrorMessage('Email ou mot de passe incorrect.')
    }
  }

  return (
    <div className="login">
      <h1 className="login__title">Connexion</h1>
      <hr className="login__hr" />
      <form onSubmit={handleSubmit} className="login__form">
        <div className="login__form-group">
          <input
            required
            id="email"
            type="email"
            value={email}
            placeholder="Email *"
            className="login__input"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="login__form-group">
          <input
            required
            id="password"
            type="password"
            value={password}
            className="login__input"
            placeholder="Mot de passe *"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errorMessage && <p className="login__error-message">{errorMessage}</p>}
        <button type="submit" className="login__button">
          Se connecter
        </button>
      </form>
      <p className="login__text">
        Pas encore membre ?
        <Link className="login__link" to="/Signup">
          Inscrivez-vous
        </Link>
      </p>
      <p className="login__text">
        Mot de passe oublié ?
        <Link className="login__link" to="/ForgotPassword">
          Cliquez ici
        </Link>
      </p>
    </div>
  )
}
