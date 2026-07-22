import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { HeartPulse, ShieldCheck, Users2, ActivitySquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../api/client'
import AlertBanner from '../components/AlertBanner'

const PUNTOS = [
  { icon: Users2, texto: 'Pacientes, citas e historia clínica en un solo lugar' },
  { icon: ActivitySquare, texto: 'Emergencias con triaje visible al instante' },
  { icon: ShieldCheck, texto: 'Acceso por roles: médico, enfermería, farmacia y más' },
]

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
    <div className="min-h-screen flex bg-bg">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-deep text-white p-12 flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-md2 bg-white/10 flex items-center justify-center">
            <HeartPulse size={20} />
          </div>
          <span className="font-display text-xl">SIIH</span>
        </div>
        <div className="relative">
          <p className="font-display text-3xl leading-snug max-w-md">
            Un sistema para acompañar cada paso de la atención hospitalaria.
          </p>
          <div className="mt-8 space-y-4">
            {PUNTOS.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.texto} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Icon size={15} />
                  </div>
                  <p className="text-sm text-white/80">{p.texto}</p>
                </div>
              )
            })}
          </div>
        </div>
        <p className="relative text-xs text-white/40">Sistema Integrado de Información Hospitalaria</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6 lg:hidden">
            <div className="inline-flex h-11 w-11 rounded-md2 bg-brand-deep text-white items-center justify-center mb-3">
              <HeartPulse size={20} />
            </div>
            <p className="font-display text-2xl text-ink">SIIH</p>
            <p className="text-sm text-inksoft mt-1">Sistema Integrado de Información Hospitalaria</p>
          </div>
          <div className="hidden lg:block mb-6">
            <p className="font-display text-2xl text-ink">Bienvenido de vuelta</p>
            <p className="text-sm text-inksoft mt-1">Ingresa tus credenciales para continuar.</p>
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
    </div>
  )
}
