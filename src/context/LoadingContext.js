// src/context/LoadingContext.js
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  subscribeToLoading,
  incrementLoading,
  decrementLoading,
} from '../store/loadingStore'

const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToLoading(setIsLoading)
    return () => unsubscribe()
  }, [])

  const startLoading = useCallback(() => {
    incrementLoading()
  }, [])

  const stopLoading = useCallback(() => {
    decrementLoading()
  }, [])

  const value = useMemo(
    () => ({
      isLoading,
      startLoading,
      stopLoading,
    }),
    [isLoading, startLoading, stopLoading]
  )

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
}

export const useLoading = () => useContext(LoadingContext)
