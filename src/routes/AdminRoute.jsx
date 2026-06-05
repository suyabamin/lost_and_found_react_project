import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex flex-center" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  if (user?.status === 'banned') {
    return <Navigate to="/login" />
  }

  return children
}

export default AdminRoute
