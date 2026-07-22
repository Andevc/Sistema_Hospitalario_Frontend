import { useEffect, useState } from 'react'
import { pacientesApi } from '../../api/pacientes'
import { apiError } from '../../api/client'
import { Users } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'

const VACIO = {
  nombre_completo: '',
  fecha_nacimiento: '',
  ci: '',
  telefono: '',
  contacto_emergencia: '',
  tipo_de_sangre: '',
  alergias: '',
  direccion: '',
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busquedaCi, setBusquedaCi] = useState('')
  const [panel, setPanel] = useState(null) // null | 'crear' | { editando: paciente }
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      setPacientes(await pacientesApi.listar())
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const abrirCrear = () => {
    setForm(VACIO)
    setErrorForm('')
    setPanel('crear')
  }

  const abrirEditar = (paciente) => {
    setForm({ ...VACIO, ...paciente, fecha_nacimiento: paciente.fecha_nacimiento || '' })
    setErrorForm('')
    setPanel({ editando: paciente })
  }

  const buscarPorCi = async (e) => {
    e.preventDefault()
    if (!busquedaCi.trim()) return cargar()
    setCargando(true)
    setError('')
    try {
      const paciente = await pacientesApi.buscarPorCi(busquedaCi.trim())
      setPacientes([paciente])
    } catch (err) {
      setPacientes([])
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      if (panel && panel.editando) {
        const { nombre_completo, fecha_nacimiento, telefono, contacto_emergencia, tipo_de_sangre, alergias, direccion } = form
        await pacientesApi.actualizar(panel.editando.id_paciente, {
          nombre_completo,
          fecha_nacimiento: fecha_nacimiento || null,
          telefono,
          contacto_emergencia,
          tipo_de_sangre,
          alergias,
          direccion,
        })
      } else {
        await pacientesApi.crear({ ...form, fecha_nacimiento: form.fecha_nacimiento || null })
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
        icon={Users}
        title="Pacientes"
        subtitle="Registro y ficha básica de pacientes del hospital."
        action={<button className="siih-btn-primary" onClick={abrirCrear}>Registrar paciente</button>}
      />

      <form onSubmit={buscarPorCi} className="flex gap-2 mb-4 max-w-sm">
        <input
          className="siih-input"
          placeholder="Buscar por CI…"
          value={busquedaCi}
          onChange={(e) => setBusquedaCi(e.target.value)}
        />
        <button type="submit" className="siih-btn-ghost">Buscar</button>
      </form>

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_paciente}
          onRowClick={abrirEditar}
          emptyLabel="Todavía no hay pacientes registrados."
          columns={[
            { key: 'nombre_completo', header: 'Nombre completo' },
            { key: 'ci', header: 'CI' },
            { key: 'telefono', header: 'Teléfono', render: (r) => r.telefono || '—' },
            { key: 'tipo_de_sangre', header: 'Tipo de sangre', render: (r) => r.tipo_de_sangre || '—' },
            { key: 'fecha_nacimiento', header: 'Nacimiento', render: (r) => r.fecha_nacimiento || '—' },
          ]}
          rows={pacientes}
        />
      )}

      <SidePanel
        open={!!panel}
        onClose={() => setPanel(null)}
        title={panel && panel.editando ? 'Editar paciente' : 'Registrar paciente'}
        subtitle={panel && panel.editando ? `CI ${panel.editando.ci}` : 'RF01'}
      >
        <form onSubmit={guardar} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}
          <div>
            <label className="siih-label">Nombre completo</label>
            <input
              className="siih-input"
              required
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            />
          </div>
          <div>
            <label className="siih-label">CI</label>
            <input
              className="siih-input"
              required
              disabled={!!(panel && panel.editando)}
              value={form.ci}
              onChange={(e) => setForm({ ...form, ci: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="siih-label">Fecha de nacimiento</label>
              <input
                type="date"
                className="siih-input"
                value={form.fecha_nacimiento || ''}
                onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
              />
            </div>
            <div>
              <label className="siih-label">Teléfono</label>
              <input
                className="siih-input"
                value={form.telefono || ''}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="siih-label">Contacto de emergencia</label>
            <input
              className="siih-input"
              value={form.contacto_emergencia || ''}
              onChange={(e) => setForm({ ...form, contacto_emergencia: e.target.value })}
            />
          </div>
          <div>
            <label className="siih-label">Tipo de sangre</label>
            <input
              className="siih-input"
              placeholder="O+, A-, ..."
              value={form.tipo_de_sangre || ''}
              onChange={(e) => setForm({ ...form, tipo_de_sangre: e.target.value })}
            />
          </div>
          <div>
            <label className="siih-label">Alergias</label>
            <textarea
              className="siih-input"
              rows={2}
              value={form.alergias || ''}
              onChange={(e) => setForm({ ...form, alergias: e.target.value })}
            />
          </div>
          <div>
            <label className="siih-label">Dirección</label>
            <textarea
              className="siih-input"
              rows={2}
              value={form.direccion || ''}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
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
