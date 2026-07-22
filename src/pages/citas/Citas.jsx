import { useEffect, useMemo, useState } from 'react'
import { citasApi } from '../../api/citas'
import { pacientesApi } from '../../api/pacientes'
import { apiError } from '../../api/client'
import { CalendarDays } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'
import StatusBadge from '../../components/StatusBadge'

function aInputLocal(fechaIso) {
  if (!fechaIso) return ''
  const d = new Date(fechaIso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Citas() {
  const [citas, setCitas] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [medicos, setMedicos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [panel, setPanel] = useState(null) // null | 'crear' | { editando }
  const [form, setForm] = useState({ id_paciente: '', id_especialidad: '', id_medico: '', fecha_hora: '' })
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [disponibilidad, setDisponibilidad] = useState(null)

  const mapaPacientes = useMemo(() => {
    const m = {}
    pacientes.forEach((p) => (m[p.id_paciente] = p.nombre_completo))
    return m
  }, [pacientes])

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const [c, p, e] = await Promise.all([citasApi.listar(), pacientesApi.listar(), citasApi.especialidades()])
      setCitas(c)
      setPacientes(p)
      setEspecialidades(e)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const onCambiaEspecialidad = async (id_especialidad) => {
    setForm((f) => ({ ...f, id_especialidad, id_medico: '' }))
    setMedicos([])
    if (!id_especialidad) return
    try {
      setMedicos(await citasApi.medicosDisponibles(Number(id_especialidad)))
    } catch {
      setMedicos([])
    }
  }

  const abrirCrear = () => {
    setForm({ id_paciente: '', id_especialidad: '', id_medico: '', fecha_hora: '' })
    setMedicos([])
    setDisponibilidad(null)
    setErrorForm('')
    setPanel('crear')
  }

  const abrirEditar = (cita) => {
    setForm({ id_paciente: cita.id_paciente, id_medico: cita.id_medico, fecha_hora: aInputLocal(cita.fecha_hora) })
    setDisponibilidad(null)
    setErrorForm('')
    setPanel({ editando: cita })
  }

  const revisarDisponibilidad = async () => {
    if (!form.id_medico || !form.fecha_hora) return
    try {
      const r = await citasApi.disponibilidad(Number(form.id_medico), new Date(form.fecha_hora).toISOString())
      setDisponibilidad(r.disponible)
    } catch (err) {
      setErrorForm(apiError(err))
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      const fecha_hora = new Date(form.fecha_hora).toISOString()
      if (panel && panel.editando) {
        await citasApi.actualizar(panel.editando.id_cita, { fecha_hora })
      } else {
        await citasApi.crear({
          id_paciente: Number(form.id_paciente),
          id_medico: Number(form.id_medico),
          fecha_hora,
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

  const cancelar = async (cita) => {
    if (!window.confirm(`¿Cancelar la cita #${cita.id_cita}?`)) return
    try {
      await citasApi.cancelar(cita.id_cita)
      cargar()
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <div>
      <PageHeader
        icon={CalendarDays}
        title="Citas"
        subtitle="Programación, reprogramación y cancelación de citas médicas."
        action={<button className="siih-btn-primary" onClick={abrirCrear}>Programar cita</button>}
      />

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_cita}
          emptyLabel="No hay citas programadas."
          columns={[
            { key: 'id_cita', header: '#' },
            { key: 'id_paciente', header: 'Paciente', render: (r) => mapaPacientes[r.id_paciente] || `#${r.id_paciente}` },
            { key: 'id_medico', header: 'Médico', render: (r) => `#${r.id_medico}` },
            { key: 'fecha_hora', header: 'Fecha y hora', render: (r) => new Date(r.fecha_hora).toLocaleString('es-BO') },
            { key: 'estado', header: 'Estado', render: (r) => <StatusBadge value={r.estado} /> },
            {
              key: 'acciones',
              header: '',
              render: (r) => (
                <div className="flex gap-2 justify-end">
                  <button className="text-brand text-xs font-medium hover:underline" onClick={() => abrirEditar(r)}>
                    Reprogramar
                  </button>
                  {r.estado !== 'Cancelada' && (
                    <button className="text-triaje-rojo text-xs font-medium hover:underline" onClick={() => cancelar(r)}>
                      Cancelar
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={citas}
        />
      )}

      <SidePanel
        open={!!panel}
        onClose={() => setPanel(null)}
        title={panel && panel.editando ? `Reprogramar cita #${panel.editando.id_cita}` : 'Programar cita'}
        subtitle="RF03 / RF04"
      >
        <form onSubmit={guardar} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}

          {!(panel && panel.editando) && (
            <>
              <div>
                <label className="siih-label">Paciente</label>
                <select
                  className="siih-input"
                  required
                  value={form.id_paciente}
                  onChange={(e) => setForm({ ...form, id_paciente: e.target.value })}
                >
                  <option value="">Selecciona un paciente…</option>
                  {pacientes.map((p) => (
                    <option key={p.id_paciente} value={p.id_paciente}>
                      {p.nombre_completo} — CI {p.ci}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="siih-label">Especialidad</label>
                <select
                  className="siih-input"
                  required
                  value={form.id_especialidad}
                  onChange={(e) => onCambiaEspecialidad(e.target.value)}
                >
                  <option value="">Selecciona especialidad…</option>
                  {especialidades.map((esp) => (
                    <option key={esp.id_especialidad} value={esp.id_especialidad}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="siih-label">Médico</label>
                <select
                  className="siih-input"
                  required
                  disabled={!form.id_especialidad}
                  value={form.id_medico}
                  onChange={(e) => setForm({ ...form, id_medico: e.target.value })}
                >
                  <option value="">Selecciona médico…</option>
                  {medicos.map((m) => (
                    <option key={m.id_medico} value={m.id_medico}>
                      Colegiatura {m.nro_colegiatura} (#{m.id_medico})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="siih-label">Fecha y hora</label>
            <input
              type="datetime-local"
              className="siih-input"
              required
              value={form.fecha_hora}
              onChange={(e) => {
                setForm({ ...form, fecha_hora: e.target.value })
                setDisponibilidad(null)
              }}
            />
          </div>

          {form.id_medico && form.fecha_hora && (
            <div className="flex items-center gap-2">
              <button type="button" className="siih-btn-ghost text-xs" onClick={revisarDisponibilidad}>
                Verificar disponibilidad
              </button>
              {disponibilidad === true && <span className="text-xs text-triaje-verde font-medium">Horario libre</span>}
              {disponibilidad === false && <span className="text-xs text-triaje-rojo font-medium">Ocupado</span>}
            </div>
          )}

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
