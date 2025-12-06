import { useState } from 'react'
import { Button } from './export'
import { Link } from 'react-router-dom'
import StatusMessage from './StatusMessage'
import { useAuth } from '../context/AuthContext'
import { postLogin } from '../repositories/userRepository'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const data = await postLogin(email, password)

      if (data.accessToken && data.user) {
        login({ accessToken: data.accessToken, user: data.user })
        setSuccessMessage('Connexion réussie ! Redirection en cours...')
      } else {
        setErrorMessage('Données de connexion invalides')
      }
    } catch (error) {
      setErrorMessage(error.message)
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
            autoComplete="username"
            placeholder="Email *"
            className="login__input"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="login__form-group">
          <input
            required
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            className="login__input"
            placeholder="Mot de passe *"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="login__button" variant="primary">
          Se connecter
        </Button>
        <StatusMessage status="error" message={errorMessage} />
        <StatusMessage status="success" message={successMessage} />
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
