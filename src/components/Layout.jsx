import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GRUPOS = [
  {
    titulo: 'Recepción',
    items: [
      { to: '/pacientes', label: 'Pacientes', roles: ['Administrador', 'Recepcionista', 'Medico', 'Enfermero'] },
      { to: '/citas', label: 'Citas', roles: ['Administrador', 'Recepcionista', 'Medico', 'Enfermero'] },
    ],
  },
  {
    titulo: 'Atención',
    items: [
      { to: '/emergencia', label: 'Emergencia', roles: ['Administrador', 'Recepcionista', 'Medico', 'Enfermero'] },
      { to: '/historia-clinica', label: 'Historia clínica', roles: ['Administrador', 'Medico', 'Enfermero'] },
      { to: '/laboratorio', label: 'Laboratorio', roles: ['Administrador', 'Medico', 'Enfermero'] },
      { to: '/recetas', label: 'Recetas', roles: ['Administrador', 'Medico', 'Farmaceutico'] },
      { to: '/hospitalizacion', label: 'Hospitalización', roles: ['Administrador', 'Medico', 'Enfermero'] },
    ],
  },
  {
    titulo: 'Soporte clínico',
    items: [{ to: '/farmacia', label: 'Farmacia', roles: ['Administrador', 'Farmaceutico', 'Enfermero'] }],
  },
  {
    titulo: 'Administración',
    items: [
      { to: '/facturacion', label: 'Facturación', roles: ['Administrador', 'Recepcionista'] },
      { to: '/reportes', label: 'Reportes', roles: ['Administrador', 'Medico', 'Recepcionista', 'Enfermero'] },
      { to: '/usuarios', label: 'Usuarios', roles: ['Administrador'] },
    ],
  },
]

export default function Layout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-60 shrink-0 bg-brand-deep text-white/90 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-display text-xl text-white leading-none">SIIH</p>
          <p className="text-xs text-white/60 mt-1">Sistema Integrado de Información Hospitalaria</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {GRUPOS.map((grupo) => {
            const items = grupo.items.filter((it) => !it.roles || it.roles.length === 0 || hasRole(...it.roles))
            if (items.length === 0) return null
            return (
              <div key={grupo.titulo}>
                <p className="px-2 text-[11px] uppercase tracking-wider text-white/45 font-medium mb-1.5">
                  {grupo.titulo}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `block rounded-md2 px-2.5 py-1.5 text-sm transition ${
                          isActive ? 'bg-white/12 text-white font-medium' : 'text-white/75 hover:bg-white/8 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-line bg-surface flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-ink font-medium leading-none">{user?.nombre_usuario}</p>
              <p className="text-xs text-inksoft leading-none mt-0.5">{user?.rol}</p>
            </div>
            <button onClick={cerrarSesion} className="siih-btn-ghost text-xs px-3 py-1.5">
              Cerrar sesión
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
