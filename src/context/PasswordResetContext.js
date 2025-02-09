import { createContext, useState, useContext } from 'react'

const PasswordResetContext = createContext()

export function PasswordResetProvider({ children }) {
  const [email, setEmail] = useState('')

  return (
    <PasswordResetContext.Provider value={{ email, setEmail }}>
      {children}
    </PasswordResetContext.Provider>
  )
}

export function usePasswordReset() {
  return useContext(PasswordResetContext)
}
