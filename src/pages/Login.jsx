import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../api/client'
import AlertBanner from '../components/AlertBanner'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [nombre_usuario, setNombreUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await login(nombre_usuario, password)
      const destino = location.state?.from?.pathname || '/'
      navigate(destino, { replace: true })
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-deep flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="font-display text-3xl text-white">SIIH</p>
          <p className="text-sm text-white/60 mt-1">Sistema Integrado de Información Hospitalaria</p>
        </div>
        <form onSubmit={onSubmit} className="siih-card p-6 space-y-4">
          {error && <AlertBanner tone="error">{error}</AlertBanner>}
          <div>
            <label className="siih-label" htmlFor="nombre_usuario">Usuario</label>
            <input
              id="nombre_usuario"
              className="siih-input"
              value={nombre_usuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="siih-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="siih-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={cargando} className="siih-btn-primary w-full">
            {cargando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
