import { useEffect, useState } from 'react'
import { facturacionApi } from '../../api/facturacion'
import { pacientesApi } from '../../api/pacientes'
import { apiError } from '../../api/client'
import { Receipt } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'

export default function Facturacion() {
  const [pacientes, setPacientes] = useState([])
  const [idPaciente, setIdPaciente] = useState('')
  const [cargos, setCargos] = useState([])
  const [seleccionados, setSeleccionados] = useState({})
  const [descuento, setDescuento] = useState(0)
  const [impuesto, setImpuesto] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [generando, setGenerando] = useState(false)
  const [factura, setFactura] = useState(null)

  const [buscarIdFactura, setBuscarIdFactura] = useState('')

  useEffect(() => {
    pacientesApi.listar().then(setPacientes).catch((err) => setError(apiError(err)))
  }, [])

  const cargarCargos = async (id) => {
    setIdPaciente(id)
    setFactura(null)
    setSeleccionados({})
    if (!id) return setCargos([])
    setCargando(true)
    setError('')
    try {
      setCargos(await facturacionApi.cargosPendientes(Number(id)))
    } catch (err) {
      setCargos([])
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  const claveCargo = (c) => `${c.tipo}-${c.id_referencia}`

  const toggle = (c) => {
    setSeleccionados((s) => ({ ...s, [claveCargo(c)]: !s[claveCargo(c)] }))
  }

  const seleccionActual = cargos.filter((c) => seleccionados[claveCargo(c)])
  const subtotalSeleccion = seleccionActual.reduce((acc, c) => acc + c.subtotal, 0)

  const generar = async () => {
    if (seleccionActual.length === 0) return
    setGenerando(true)
    setError('')
    try {
      const f = await facturacionApi.generar({
        id_paciente: Number(idPaciente),
        items: seleccionActual.map((c) => ({ tipo: c.tipo, id_referencia: c.id_referencia })),
        descuento: Number(descuento) || 0,
        impuesto: Number(impuesto) || 0,
      })
      setFactura(f)
      cargarCargos(idPaciente)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setGenerando(false)
    }
  }

  const buscarFactura = async (e) => {
    e.preventDefault()
    if (!buscarIdFactura) return
    setError('')
    try {
      setFactura(await facturacionApi.obtener(Number(buscarIdFactura)))
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <div>
      <PageHeader icon={Receipt} title="Facturación" subtitle="Consolidación de cargos pendientes y emisión de factura." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="max-w-sm mb-4">
            <label className="siih-label">Paciente</label>
            <select className="siih-input" value={idPaciente} onChange={(e) => cargarCargos(e.target.value)}>
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
            <EmptyState label="Selecciona un paciente" hint="Elige un paciente para ver sus cargos pendientes de facturar." />
          ) : cargando ? (
            <LoadingSpinner />
          ) : (
            <>
              <DataTable
                rowKey={claveCargo}
                emptyLabel="Este paciente no tiene cargos pendientes. ✅"
                columns={[
                  {
                    key: 'sel',
                    header: '',
                    render: (c) => (
                      <input type="checkbox" checked={!!seleccionados[claveCargo(c)]} onChange={() => toggle(c)} />
                    ),
                  },
                  { key: 'tipo', header: 'Tipo' },
                  { key: 'descripcion', header: 'Descripción' },
                  { key: 'cantidad', header: 'Cant.' },
                  { key: 'precio_unitario', header: 'Precio unit.', render: (c) => `Bs ${c.precio_unitario.toFixed(2)}` },
                  { key: 'subtotal', header: 'Subtotal', render: (c) => `Bs ${c.subtotal.toFixed(2)}` },
                ]}
                rows={cargos}
              />

              {cargos.length > 0 && (
                <div className="siih-card p-4 mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-inksoft">Subtotal seleccionado</span>
                    <span className="font-medium text-ink">Bs {subtotalSeleccion.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="siih-label">Descuento (Bs)</label>
                      <input type="number" className="siih-input" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
                    </div>
                    <div>
                      <label className="siih-label">Impuesto (Bs)</label>
                      <input type="number" className="siih-input" value={impuesto} onChange={(e) => setImpuesto(e.target.value)} />
                    </div>
                  </div>
                  <button
                    className="siih-btn-primary w-full"
                    disabled={seleccionActual.length === 0 || generando}
                    onClick={generar}
                  >
                    {generando ? 'Generando…' : `Generar factura (${seleccionActual.length} ítem/s)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <form onSubmit={buscarFactura} className="flex gap-2 mb-4 max-w-sm">
            <input className="siih-input" placeholder="Buscar factura por # ID…" value={buscarIdFactura} onChange={(e) => setBuscarIdFactura(e.target.value)} />
            <button className="siih-btn-ghost" type="submit">Ver</button>
          </form>

          {factura ? (
            <div className="siih-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl text-ink">Factura #{factura.id_factura}</p>
                  <p className="text-xs text-inksoft mt-0.5">Paciente #{factura.id_paciente} · {factura.fecha}</p>
                </div>
                <StatusBadge value={factura.estado} />
              </div>
              <div className="divide-y divide-line">
                {factura.detalle.map((d, i) => (
                  <div key={i} className="py-2 flex justify-between text-sm">
                    <span className="text-ink">{d.tipo_servicio} #{d.id_referencia} × {d.cantidad}</span>
                    <span className="text-inksoft">Bs {d.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-line pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-inksoft"><span>Subtotal</span><span>Bs {factura.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-inksoft"><span>Descuento</span><span>- Bs {factura.descuento.toFixed(2)}</span></div>
                <div className="flex justify-between text-inksoft"><span>Impuesto</span><span>+ Bs {factura.impuesto.toFixed(2)}</span></div>
                <div className="flex justify-between text-ink font-display text-lg pt-1"><span>Total</span><span>Bs {factura.total.toFixed(2)}</span></div>
              </div>
            </div>
          ) : (
            <EmptyState label="Sin factura seleccionada" hint="Genera una factura o busca una existente por su número para ver el detalle aquí." />
          )}
        </div>
      </div>
    </div>
  )
}
