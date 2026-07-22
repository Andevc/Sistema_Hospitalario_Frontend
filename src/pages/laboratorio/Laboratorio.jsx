import { useEffect, useState } from 'react'
import { laboratorioApi } from '../../api/laboratorio'
import { apiError } from '../../api/client'
import { FlaskConical } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'

const VACIO = {
  id_consulta: '',
  id_atencion_emerg: '',
  id_hospitalizacion: '',
  id_tipo_examen: '',
  resultado: '',
  fecha_resultado: '',
}

export default function Laboratorio() {
  const [examenes, setExamenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [panel, setPanel] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      setExamenes(await laboratorioApi.listar())
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

  const abrirEditar = (examen) => {
    setForm({
      ...VACIO,
      ...examen,
      id_consulta: examen.id_consulta ?? '',
      id_atencion_emerg: examen.id_atencion_emerg ?? '',
      id_hospitalizacion: examen.id_hospitalizacion ?? '',
    })
    setErrorForm('')
    setPanel({ editando: examen })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      if (panel && panel.editando) {
        await laboratorioApi.actualizar(panel.editando.id_examen, {
          resultado: form.resultado,
          fecha_resultado: form.fecha_resultado,
        })
      } else {
        await laboratorioApi.crear({
          id_consulta: form.id_consulta ? Number(form.id_consulta) : null,
          id_atencion_emerg: form.id_atencion_emerg ? Number(form.id_atencion_emerg) : null,
          id_hospitalizacion: form.id_hospitalizacion ? Number(form.id_hospitalizacion) : null,
          id_tipo_examen: Number(form.id_tipo_examen),
          resultado: form.resultado || null,
          fecha_resultado: form.fecha_resultado,
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
        icon={FlaskConical}
        title="Laboratorio"
        subtitle="Exámenes solicitados y resultados."
        action={<button className="siih-btn-primary" onClick={abrirCrear}>Registrar examen</button>}
      />

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_examen}
          onRowClick={abrirEditar}
          emptyLabel="No hay exámenes registrados."
          columns={[
            { key: 'id_examen', header: '#' },
            { key: 'id_tipo_examen', header: 'Tipo de examen' },
            {
              key: 'origen',
              header: 'Origen',
              render: (r) =>
                r.id_consulta ? `Consulta #${r.id_consulta}` : r.id_atencion_emerg ? `Emergencia #${r.id_atencion_emerg}` : r.id_hospitalizacion ? `Hospitalización #${r.id_hospitalizacion}` : '—',
            },
            { key: 'resultado', header: 'Resultado', render: (r) => r.resultado || 'Pendiente' },
            { key: 'fecha_resultado', header: 'Fecha resultado' },
          ]}
          rows={examenes}
        />
      )}

      <SidePanel
        open={!!panel}
        onClose={() => setPanel(null)}
        title={panel && panel.editando ? `Examen #${panel.editando.id_examen}` : 'Registrar examen'}
        subtitle="RF08"
      >
        <form onSubmit={guardar} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}
          {!(panel && panel.editando) && (
            <>
              <div>
                <label className="siih-label">ID tipo de examen</label>
                <input
                  className="siih-input"
                  type="number"
                  required
                  value={form.id_tipo_examen}
                  onChange={(e) => setForm({ ...form, id_tipo_examen: e.target.value })}
                />
              </div>
              <p className="text-xs text-inksoft">Asocia el examen a uno de estos orígenes (opcional, deja el resto vacío):</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="siih-label">Consulta</label>
                  <input
                    className="siih-input"
                    type="number"
                    value={form.id_consulta}
                    onChange={(e) => setForm({ ...form, id_consulta: e.target.value })}
                  />
                </div>
                <div>
                  <label className="siih-label">Emergencia</label>
                  <input
                    className="siih-input"
                    type="number"
                    value={form.id_atencion_emerg}
                    onChange={(e) => setForm({ ...form, id_atencion_emerg: e.target.value })}
                  />
                </div>
                <div>
                  <label className="siih-label">Hospitalización</label>
                  <input
                    className="siih-input"
                    type="number"
                    value={form.id_hospitalizacion}
                    onChange={(e) => setForm({ ...form, id_hospitalizacion: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="siih-label">Fecha de resultado</label>
            <input
              type="date"
              className="siih-input"
              required
              value={form.fecha_resultado}
              onChange={(e) => setForm({ ...form, fecha_resultado: e.target.value })}
            />
          </div>
          <div>
            <label className="siih-label">Resultado</label>
            <textarea
              className="siih-input"
              rows={3}
              value={form.resultado || ''}
              onChange={(e) => setForm({ ...form, resultado: e.target.value })}
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
