// src/pages/visitor/Signup.jsx
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import postSignUp from '../../services/user/postSignUp'

const Signup = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    userPhone: '',
    civility: '',
    confirmPassword: '',
    newsletter: true,
  })
  const navigate = useNavigate()
  const { setSignupEmail } = useAuth()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'userPhone'
          ? formatPhoneNumber(value)
          : value,
    }))
  }

  const formatPhoneNumber = (phone) => {
    if (phone.startsWith('0')) {
      return '+33' + phone.slice(1)
    }
    return phone
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.')
      return
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

    if (!emailRegex.test(formData.email)) {
      alert("L'email n’est pas valide, veuillez entrer un email correct.")
      return
    }

    const userData = {
      email: formData.email.trim(),
      password: formData.password,
      firstname: formData.firstname,
      lastname: formData.lastname,
      userPhone: formData.userPhone,
      civility: formData.civility,
      newsletter: formData.newsletter,
    }

    try {
      await postSignUp(userData)
      setSignupEmail(userData.email)

      setErrorMessage('')
      setSuccessMessage('Inscription réussie ! Redirection en cours...')

      setTimeout(() => {
        navigate('/verifyEmail')
      }, 5000)
    } catch (error) {
      console.log('Erreur : ', error.message)
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="signup">
      <h1 className="signup__title">S'inscrire</h1>
      <hr className="signup__hr" />
      <p className="signup__subtitle">Pas encore membre ? Inscrivez-vous</p>
      <form onSubmit={handleSubmit} className="signup__form">
        <div className="signup__form__group__user-info">
          <input
            type="text"
            name="lastname"
            placeholder="Nom"
            className="signup__form__group__user-info__input"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="firstname"
            placeholder="Prénom"
            className="signup__form__group__user-info__input"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="signup__form__group__user-info__input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="userPhone"
            placeholder="Téléphone"
            className="signup__form__group__user-info__input"
            value={formData.userPhone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="signup__form__group signup__form__group--select">
          <select
            id="civility"
            name="civility"
            className="signup__form__input signup__form__input--select"
            value={formData.civility}
            onChange={handleChange}
            required
          >
            <option value="">Civilité</option>
            <option value="Mr">Homme</option>
            <option value="Mme">Femme</option>
          </select>
        </div>

        <div className="signup__form__group__password">
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="signup__form__group__password__input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            className="signup__form__group__password__input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {/* Newsletter */}
        <div className="signup__form__group signup__form__group--checkbox">
          <input
            type="checkbox"
            id="newsletter"
            name="newsletter"
            className="signup__form__group--checkbox__checkbox"
            checked={formData.newsletter}
            onChange={handleChange}
          />
          <label
            htmlFor="newsletter"
            className="signup__form__group--checkbox__label"
          >
            Souhaitez-vous recevoir les actualités et les évènements par mail.
          </label>
        </div>

        <div className="signup__form__actions">
          <button type="submit" className="signup__form__actions--submit">
            S'inscrire
          </button>
        </div>
      </form>
      {errorMessage && <div className="signup__error">{errorMessage}</div>}
      {successMessage && (
        <div className="signup__success">{successMessage}</div>
      )}
      <p className="signup__terms">
        En vous inscrivant, vous acceptez les
        <Link to="/CGU" className="signup__terms__link">
          conditions générales d’utilisation
        </Link>
        du site
      </p>
      <p className="signup__login">
        Déjà membre ?
        <Link to="/Profil" className="signup__login__link">
          Connectez-vous
        </Link>
      </p>
    </div>
  )
}

export default Signup
