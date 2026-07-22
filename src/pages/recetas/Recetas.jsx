import { useEffect, useState } from 'react'
import { recetasApi } from '../../api/recetas'
import { apiError } from '../../api/client'
import { Pill } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'
import StatusBadge from '../../components/StatusBadge'

const VACIO = {
  id_consulta: '',
  id_atencion_emerg: '',
  id_hospitalizacion: '',
  id_medicamento: '',
  dosis: '',
  indicaciones: '',
  cantidad: 1,
}

export default function Recetas() {
  const [recetas, setRecetas] = useState([])
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
      setRecetas(await recetasApi.listar())
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

  const abrirEditar = (receta) => {
    setForm({
      ...VACIO,
      ...receta,
      id_consulta: receta.id_consulta ?? '',
      id_atencion_emerg: receta.id_atencion_emerg ?? '',
      id_hospitalizacion: receta.id_hospitalizacion ?? '',
    })
    setErrorForm('')
    setPanel({ editando: receta })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      if (panel && panel.editando) {
        await recetasApi.actualizar(panel.editando.id_receta, {
          id_medicamento: Number(form.id_medicamento),
          dosis: form.dosis,
          indicaciones: form.indicaciones,
          cantidad: Number(form.cantidad),
        })
      } else {
        await recetasApi.crear({
          id_consulta: form.id_consulta ? Number(form.id_consulta) : null,
          id_atencion_emerg: form.id_atencion_emerg ? Number(form.id_atencion_emerg) : null,
          id_hospitalizacion: form.id_hospitalizacion ? Number(form.id_hospitalizacion) : null,
          id_medicamento: Number(form.id_medicamento),
          dosis: form.dosis,
          indicaciones: form.indicaciones,
          cantidad: Number(form.cantidad),
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
        icon={Pill}
        title="Recetas"
        subtitle="Emisión de recetas médicas (RF07). La dispensación se hace desde Farmacia."
        action={<button className="siih-btn-primary" onClick={abrirCrear}>Emitir receta</button>}
      />

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_receta}
          onRowClick={abrirEditar}
          emptyLabel="No hay recetas registradas."
          columns={[
            { key: 'id_receta', header: '#' },
            { key: 'id_medicamento', header: 'Medicamento', render: (r) => `#${r.id_medicamento}` },
            { key: 'dosis', header: 'Dosis' },
            { key: 'cantidad', header: 'Cantidad' },
            { key: 'estado', header: 'Estado', render: (r) => <StatusBadge value={r.estado} /> },
          ]}
          rows={recetas}
        />
      )}

      <SidePanel
        open={!!panel}
        onClose={() => setPanel(null)}
        title={panel && panel.editando ? `Receta #${panel.editando.id_receta}` : 'Emitir receta'}
        subtitle="RF07"
      >
        <form onSubmit={guardar} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}
          {!(panel && panel.editando) && (
            <>
              <p className="text-xs text-inksoft">Asocia la receta a uno de estos orígenes (opcional):</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="siih-label">Consulta</label>
                  <input className="siih-input" type="number" value={form.id_consulta} onChange={(e) => setForm({ ...form, id_consulta: e.target.value })} />
                </div>
                <div>
                  <label className="siih-label">Emergencia</label>
                  <input className="siih-input" type="number" value={form.id_atencion_emerg} onChange={(e) => setForm({ ...form, id_atencion_emerg: e.target.value })} />
                </div>
                <div>
                  <label className="siih-label">Hospitalización</label>
                  <input className="siih-input" type="number" value={form.id_hospitalizacion} onChange={(e) => setForm({ ...form, id_hospitalizacion: e.target.value })} />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="siih-label">ID medicamento</label>
            <input
              className="siih-input"
              type="number"
              required
              value={form.id_medicamento}
              onChange={(e) => setForm({ ...form, id_medicamento: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="siih-label">Dosis</label>
              <input className="siih-input" required value={form.dosis} onChange={(e) => setForm({ ...form, dosis: e.target.value })} />
            </div>
            <div>
              <label className="siih-label">Cantidad</label>
              <input
                type="number"
                min={1}
                className="siih-input"
                required
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="siih-label">Indicaciones</label>
            <textarea
              className="siih-input"
              rows={3}
              required
              value={form.indicaciones}
              onChange={(e) => setForm({ ...form, indicaciones: e.target.value })}
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
