import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = () => {
  const { isAdmin } = useAuth()

  return isAdmin ? <Outlet /> : <Navigate to="/" />
}

export default PrivateRoute