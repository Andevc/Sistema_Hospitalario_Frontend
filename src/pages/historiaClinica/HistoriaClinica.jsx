import { useEffect, useState } from 'react'
import { historiaClinicaApi } from '../../api/historiaClinica'
import { pacientesApi } from '../../api/pacientes'
import { apiError } from '../../api/client'
import { FileText } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'
import EmptyState from '../../components/EmptyState'

export default function HistoriaClinica() {
  const [pacientes, setPacientes] = useState([])
  const [idPaciente, setIdPaciente] = useState('')
  const [consultas, setConsultas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [panel, setPanel] = useState(null) // 'crear' | { editando }
  const [form, setForm] = useState({ id_cita: '', id_medico: '', fecha: '', motivo: '', diagnostico: '' })
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  useEffect(() => {
    pacientesApi.listar().then(setPacientes).catch((err) => setError(apiError(err)))
  }, [])

  const buscarHistorial = async (id) => {
    if (!id) return
    setCargando(true)
    setError('')
    try {
      setConsultas(await historiaClinicaApi.historialPaciente(Number(id)))
    } catch (err) {
      setConsultas([])
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  const onCambiaPaciente = (id) => {
    setIdPaciente(id)
    buscarHistorial(id)
  }

  const abrirCrear = () => {
    setForm({ id_cita: '', id_medico: '', fecha: new Date().toISOString().slice(0, 10), motivo: '', diagnostico: '' })
    setErrorForm('')
    setPanel('crear')
  }

  const abrirEditar = (consulta) => {
    setForm({ ...consulta })
    setErrorForm('')
    setPanel({ editando: consulta })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      if (panel && panel.editando) {
        await historiaClinicaApi.actualizarConsulta(panel.editando.id_consulta, {
          motivo: form.motivo,
          diagnostico: form.diagnostico,
        })
      } else {
        await historiaClinicaApi.crearConsulta({
          id_cita: Number(form.id_cita),
          id_paciente: Number(idPaciente),
          id_medico: Number(form.id_medico),
          fecha: form.fecha,
          motivo: form.motivo,
          diagnostico: form.diagnostico,
        })
      }
      setPanel(null)
      buscarHistorial(idPaciente)
    } catch (err) {
      setErrorForm(apiError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <PageHeader
        icon={FileText}
        title="Historia clínica"
        subtitle="Consultas médicas por paciente."
        action={
          <button className="siih-btn-primary" onClick={abrirCrear} disabled={!idPaciente}>
            Registrar consulta
          </button>
        }
      />

      <div className="max-w-sm mb-5">
        <label className="siih-label">Paciente</label>
        <select className="siih-input" value={idPaciente} onChange={(e) => onCambiaPaciente(e.target.value)}>
          <option value="">Selecciona un paciente…</option>
          {pacientes.map((p) => (
            <option key={p.id_paciente} value={p.id_paciente}>
              {p.nombre_completo} — CI {p.ci}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {!idPaciente ? (
        <EmptyState label="Selecciona un paciente" hint="Elige un paciente arriba para ver su historial de consultas." />
      ) : cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_consulta}
          onRowClick={abrirEditar}
          emptyLabel="Este paciente no tiene consultas registradas."
          columns={[
            { key: 'id_consulta', header: '#' },
            { key: 'fecha', header: 'Fecha' },
            { key: 'id_medico', header: 'Médico', render: (r) => `#${r.id_medico}` },
            { key: 'motivo', header: 'Motivo', render: (r) => r.motivo || '—' },
            { key: 'diagnostico', header: 'Diagnóstico', render: (r) => r.diagnostico || '—' },
          ]}
          rows={consultas}
        />
      )}

      <SidePanel
        open={!!panel}
        onClose={() => setPanel(null)}
        title={panel && panel.editando ? `Consulta #${panel.editando.id_consulta}` : 'Registrar consulta'}
        subtitle="RF05 / RF06"
      >
        <form onSubmit={guardar} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}
          {!(panel && panel.editando) && (
            <>
              <div>
                <label className="siih-label">ID de cita asociada</label>
                <input
                  className="siih-input"
                  type="number"
                  required
                  value={form.id_cita}
                  onChange={(e) => setForm({ ...form, id_cita: e.target.value })}
                />
              </div>
              <div>
                <label className="siih-label">ID médico</label>
                <input
                  className="siih-input"
                  type="number"
                  required
                  value={form.id_medico}
                  onChange={(e) => setForm({ ...form, id_medico: e.target.value })}
                />
              </div>
              <div>
                <label className="siih-label">Fecha</label>
                <input
                  type="date"
                  className="siih-input"
                  required
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
              </div>
            </>
          )}
          <div>
            <label className="siih-label">Motivo</label>
            <textarea
              className="siih-input"
              rows={2}
              value={form.motivo || ''}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            />
          </div>
          <div>
            <label className="siih-label">Diagnóstico</label>
            <textarea
              className="siih-input"
              rows={3}
              value={form.diagnostico || ''}
              onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
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
