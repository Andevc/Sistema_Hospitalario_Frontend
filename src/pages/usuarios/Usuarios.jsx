import { useEffect, useState } from 'react'
import { authApi } from '../../api/auth'
import { apiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'
import StatusBadge from '../../components/StatusBadge'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [panel, setPanel] = useState(null) // 'crear' | { editando }
  const [form, setForm] = useState({ nombre_usuario: '', email: '', id_rol: '', password: '', estado: 'Activo' })
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const [u, r] = await Promise.all([authApi.listarUsuarios(), authApi.roles()])
      setUsuarios(u)
      setRoles(r)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const mapaRoles = Object.fromEntries(roles.map((r) => [r.id_rol, r.nombre]))

  const abrirCrear = () => {
    setForm({ nombre_usuario: '', email: '', id_rol: roles[0]?.id_rol || '', password: '', estado: 'Activo' })
    setErrorForm('')
    setPanel('crear')
  }

  const abrirEditar = (usuario) => {
    setForm({ ...usuario, password: '' })
    setErrorForm('')
    setPanel({ editando: usuario })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      if (panel && panel.editando) {
        const cambios = { email: form.email, id_rol: Number(form.id_rol), estado: form.estado }
        if (form.password) cambios.password = form.password
        await authApi.actualizarUsuario(panel.editando.id_usuario, cambios)
      } else {
        await authApi.registro({
          nombre_usuario: form.nombre_usuario,
          email: form.email || null,
          id_rol: Number(form.id_rol),
          password: form.password,
        })
      }
      setPanel(null)
      cargar()
    } catch (err) {
      setErrorForm(apiError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle="Registro de cuentas y control de acceso por rol (RF12 / RF13)."
        action={<button className="siih-btn-primary" onClick={abrirCrear}>Nuevo usuario</button>}
      />

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_usuario}
          onRowClick={abrirEditar}
          emptyLabel="No hay usuarios registrados."
          columns={[
            { key: 'nombre_usuario', header: 'Usuario' },
            { key: 'email', header: 'Email', render: (r) => r.email || '—' },
            { key: 'id_rol', header: 'Rol', render: (r) => mapaRoles[r.id_rol] || `#${r.id_rol}` },
            { key: 'estado', header: 'Estado', render: (r) => <StatusBadge value={r.estado} /> },
          ]}
          rows={usuarios}
        />
      )}

      <SidePanel
        open={!!panel}
        onClose={() => setPanel(null)}
        title={panel && panel.editando ? `Editar ${panel.editando.nombre_usuario}` : 'Nuevo usuario'}
        subtitle="RF12 / RF13"
      >
        <form onSubmit={guardar} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}
          {!(panel && panel.editando) && (
            <div>
              <label className="siih-label">Nombre de usuario</label>
              <input
                className="siih-input"
                required
                value={form.nombre_usuario}
                onChange={(e) => setForm({ ...form, nombre_usuario: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="siih-label">Email</label>
            <input
              type="email"
              className="siih-input"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="siih-label">Rol</label>
            <select className="siih-input" required value={form.id_rol} onChange={(e) => setForm({ ...form, id_rol: e.target.value })}>
              {roles.map((r) => (
                <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
              ))}
            </select>
          </div>
          {panel && panel.editando && (
            <div>
              <label className="siih-label">Estado</label>
              <select className="siih-input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          )}
          <div>
            <label className="siih-label">{panel && panel.editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
            <input
              type="password"
              className="siih-input"
              required={!(panel && panel.editando)}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="siih-btn-ghost" onClick={() => setPanel(null)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="siih-btn-primary">
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </SidePanel>
    </div>
  )
}
