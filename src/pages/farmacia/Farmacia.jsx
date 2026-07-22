import { useEffect, useState } from 'react'
import { farmaciaApi } from '../../api/farmacia'
import { apiError } from '../../api/client'
import { Pill } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'
import StatusBadge from '../../components/StatusBadge'

export default function Farmacia() {
  const [medicamentos, setMedicamentos] = useState([])
  const [soloAlertas, setSoloAlertas] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [panel, setPanel] = useState(false)
  const [form, setForm] = useState({ id_receta: '', cantidad: '' })
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [resultado, setResultado] = useState(null)

  const cargar = async (alertas = soloAlertas) => {
    setCargando(true)
    setError('')
    try {
      setMedicamentos(alertas ? await farmaciaApi.alertasStock() : await farmaciaApi.listarMedicamentos())
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar(soloAlertas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloAlertas])

  const abrirDispensar = () => {
    setForm({ id_receta: '', cantidad: '' })
    setResultado(null)
    setErrorForm('')
    setPanel(true)
  }

  const dispensar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    setResultado(null)
    try {
      const r = await farmaciaApi.dispensar({
        id_receta: Number(form.id_receta),
        cantidad: form.cantidad ? Number(form.cantidad) : null,
      })
      setResultado(r)
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
        title="Farmacia"
        subtitle="Inventario de medicamentos y dispensación de recetas (RF09)."
        action={<button className="siih-btn-primary" onClick={abrirDispensar}>Dispensar receta</button>}
      />

      <label className="flex items-center gap-2 text-sm text-inksoft mb-4">
        <input type="checkbox" checked={soloAlertas} onChange={(e) => setSoloAlertas(e.target.checked)} />
        Mostrar solo medicamentos por debajo del stock mínimo
      </label>

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_medicamento}
          emptyLabel={soloAlertas ? 'No hay medicamentos con stock bajo. ✅' : 'No hay medicamentos registrados.'}
          columns={[
            { key: 'id_medicamento', header: '#' },
            { key: 'nombre', header: 'Medicamento' },
            { key: 'stock_actual', header: 'Stock actual' },
            { key: 'stock_minimo', header: 'Stock mínimo' },
            { key: 'precio_unitario', header: 'Precio unitario', render: (r) => `Bs ${Number(r.precio_unitario).toFixed(2)}` },
            {
              key: 'bajo_stock',
              header: 'Estado',
              render: (r) => <StatusBadge value={r.bajo_stock ? 'Crítico' : 'Disponible'} />,
            },
          ]}
          rows={medicamentos}
        />
      )}

      <SidePanel open={panel} onClose={() => setPanel(false)} title="Dispensar receta" subtitle="RF09">
        <form onSubmit={dispensar} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}
          <div>
            <label className="siih-label">ID receta</label>
            <input
              className="siih-input"
              type="number"
              required
              value={form.id_receta}
              onChange={(e) => setForm({ ...form, id_receta: e.target.value })}
            />
          </div>
          <div>
            <label className="siih-label">Cantidad (opcional)</label>
            <input
              className="siih-input"
              type="number"
              placeholder="Si se omite, se usa la cantidad de la receta"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="siih-btn-ghost" onClick={() => setPanel(false)}>Cerrar</button>
            <button type="submit" disabled={guardando} className="siih-btn-primary">
              {guardando ? 'Dispensando…' : 'Dispensar'}
            </button>
          </div>

          {resultado && (
            <div className="siih-card p-3 mt-2 space-y-2">
              <p className="text-sm font-medium text-ink">
                Receta #{resultado.id_receta} · <StatusBadge value={resultado.estado} /> · {resultado.cantidad_dispensada} unidades
              </p>
              <div className="space-y-1">
                {resultado.movimientos_por_lote.map((m) => (
                  <p key={m.id_lote} className="text-xs text-inksoft">
                    Lote {m.codigo_lote}: {m.cantidad} unidades (vence {m.fecha_vencimiento})
                  </p>
                ))}
              </div>
            </div>
          )}
        </form>
      </SidePanel>
    </div>
  )
}
