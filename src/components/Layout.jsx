import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Users,
  CalendarDays,
  Siren,
  FileText,
  FlaskConical,
  Pill,
  BedDouble,
  Receipt,
  BarChart3,
  UserCog,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const GRUPOS = [
  {
    titulo: 'Recepción',
    items: [
      { to: '/pacientes', label: 'Pacientes', icon: Users, roles: ['Administrador', 'Recepcionista', 'Medico', 'Enfermero'] },
      { to: '/citas', label: 'Citas', icon: CalendarDays, roles: ['Administrador', 'Recepcionista', 'Medico', 'Enfermero'] },
    ],
  },
  {
    titulo: 'Atención',
    items: [
      { to: '/emergencia', label: 'Emergencia', icon: Siren, roles: ['Administrador', 'Recepcionista', 'Medico', 'Enfermero'] },
      { to: '/historia-clinica', label: 'Historia clínica', icon: FileText, roles: ['Administrador', 'Medico', 'Enfermero'] },
      { to: '/laboratorio', label: 'Laboratorio', icon: FlaskConical, roles: ['Administrador', 'Medico', 'Enfermero'] },
      { to: '/recetas', label: 'Recetas', icon: Pill, roles: ['Administrador', 'Medico', 'Farmaceutico'] },
      { to: '/hospitalizacion', label: 'Hospitalización', icon: BedDouble, roles: ['Administrador', 'Medico', 'Enfermero'] },
    ],
  },
  {
    titulo: 'Soporte clínico',
    items: [{ to: '/farmacia', label: 'Farmacia', icon: Pill, roles: ['Administrador', 'Farmaceutico', 'Enfermero'] }],
  },
  {
    titulo: 'Administración',
    items: [
      { to: '/facturacion', label: 'Facturación', icon: Receipt, roles: ['Administrador', 'Recepcionista'] },
      { to: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['Administrador', 'Medico', 'Recepcionista', 'Enfermero'] },
      { to: '/usuarios', label: 'Usuarios', icon: UserCog, roles: ['Administrador'] },
    ],
  },
]

function iniciales(nombre) {
  if (!nombre) return '?'
  const partes = nombre.trim().split(/\s+/)
  const letras = partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].slice(0, 2)
  return letras.toUpperCase()
}

export default function Layout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-64 shrink-0 bg-brand-deep text-white/90 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md2 bg-white/10 flex items-center justify-center shrink-0">
            <span className="font-display text-lg text-white leading-none">S</span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg text-white leading-none">SIIH</p>
            <p className="text-[11px] text-white/50 mt-1 leading-none truncate">
              Sistema Integrado de Información Hospitalaria
            </p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {GRUPOS.map((grupo) => {
            const items = grupo.items.filter((it) => !it.roles || it.roles.length === 0 || hasRole(...it.roles))
            if (items.length === 0) return null
            return (
              <div key={grupo.titulo}>
                <p className="px-2.5 text-[11px] uppercase tracking-wider text-white/40 font-medium mb-1.5">
                  {grupo.titulo}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-md2 px-2.5 py-2 text-sm transition ${
                            isActive
                              ? 'bg-white/12 text-white font-medium'
                              : 'text-white/70 hover:bg-white/8 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full transition-opacity ${
                                isActive ? 'bg-white opacity-100' : 'opacity-0'
                              }`}
                            />
                            <Icon size={16} strokeWidth={2} className="shrink-0 opacity-90" />
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
        <div className="px-3 py-3 border-t border-white/10">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-2.5 rounded-md2 px-2.5 py-2 text-sm text-white/70 hover:bg-white/8 hover:text-white transition"
          >
            <LogOut size={16} strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-line bg-surface flex items-center justify-end px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-ink font-medium leading-none">{user?.nombre_usuario}</p>
              <p className="text-xs text-inksoft leading-none mt-0.5">{user?.rol}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-soft text-brand-deep flex items-center justify-center text-xs font-semibold shrink-0">
              {iniciales(user?.nombre_usuario)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
