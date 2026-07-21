import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, hasRole } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <div className="siih-card p-8 text-center">
        <p className="font-display text-lg text-ink">No tienes permiso para ver esta sección.</p>
        <p className="text-sm text-inksoft mt-1">Se requiere alguno de estos roles: {roles.join(', ')}.</p>
      </div>
    )
  }
  return children
}
