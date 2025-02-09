import React from 'react'
import RequestEmail from '../../components/forgotPassword/RequestEmail'
import ResetPassword from '../../components/forgotPassword/ResetforgotPassword'
import { useSearchParams } from 'react-router-dom'
import { PasswordResetProvider } from '../../context/PasswordResetContext'

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <PasswordResetProvider>
      <div className="forgot-password">
        {token ? <ResetPassword token={token} /> : <RequestEmail />}
      </div>
    </PasswordResetProvider>
  )
}
