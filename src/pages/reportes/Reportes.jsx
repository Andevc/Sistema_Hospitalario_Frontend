import { useState } from 'react'
import { reportesApi } from '../../api/reportes'
import { apiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import EmptyState from '../../components/EmptyState'

function hoy() {
  return new Date().toISOString().slice(0, 10)
}
function haceUnMes() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

function Barra({ label, valor, max, formato }) {
  const pct = max > 0 ? Math.max(4, Math.round((valor / max) * 100)) : 4
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-ink font-medium">{label}</span>
        <span className="text-inksoft">{formato ? formato(valor) : valor}</span>
      </div>
      <div className="h-2 rounded-full bg-brand-soft overflow-hidden">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Reportes() {
  const [fechaInicio, setFechaInicio] = useState(haceUnMes())
  const [fechaFin, setFechaFin] = useState(hoy())
  const [top, setTop] = useState(5)

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [pacientesEsp, setPacientesEsp] = useState(null)
  const [ingresos, setIngresos] = useState(null)
  const [medicamentos, setMedicamentos] = useState(null)

  const generar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const [pe, ing, med] = await Promise.all([
        reportesApi.pacientesPorEspecialidad(fechaInicio, fechaFin),
        reportesApi.ingresos(fechaInicio, fechaFin),
        reportesApi.medicamentosMasDispensados(Number(top)),
      ])
      setPacientesEsp(pe)
      setIngresos(ing)
      setMedicamentos(med)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  const maxPacientes = pacientesEsp ? Math.max(...pacientesEsp.map((p) => p.pacientes_atendidos), 1) : 1
  const maxMed = medicamentos ? Math.max(...medicamentos.map((m) => m.cantidad_dispensada), 1) : 1
  const maxIngresoDia = ingresos ? Math.max(...ingresos.detalle_por_dia.map((d) => d.total), 1) : 1

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Estadísticas operativas por rango de fechas (RF11)." />

      <form onSubmit={generar} className="siih-card p-4 flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="siih-label">Desde</label>
          <input type="date" className="siih-input" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
        </div>
        <div>
          <label className="siih-label">Hasta</label>
          <input type="date" className="siih-input" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
        </div>
        <div className="w-28">
          <label className="siih-label">Top medicamentos</label>
          <input type="number" min={1} max={50} className="siih-input" value={top} onChange={(e) => setTop(e.target.value)} />
        </div>
        <button className="siih-btn-primary" type="submit" disabled={cargando}>
          {cargando ? 'Generando…' : 'Generar reportes'}
        </button>
      </form>

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : !pacientesEsp ? (
        <EmptyState label="Sin reportes generados" hint="Elige un rango de fechas y genera los reportes para verlos aquí." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="siih-card p-5">
            <p className="font-display text-lg text-ink mb-4">Pacientes atendidos por especialidad</p>
            {pacientesEsp.length === 0 ? (
              <p className="text-sm text-inksoft">Sin atenciones en este rango.</p>
            ) : (
              pacientesEsp.map((p) => (
                <Barra key={p.especialidad} label={p.especialidad} valor={p.pacientes_atendidos} max={maxPacientes} />
              ))
            )}
          </div>

          <div className="siih-card p-5">
            <p className="font-display text-lg text-ink mb-1">Ingresos por facturación</p>
            <p className="font-display text-3xl text-brand mb-4">Bs {ingresos.ingreso_total.toFixed(2)}</p>
            {ingresos.detalle_por_dia.length === 0 ? (
              <p className="text-sm text-inksoft">Sin ingresos registrados en este rango.</p>
            ) : (
              ingresos.detalle_por_dia.map((d) => (
                <Barra key={d.fecha} label={d.fecha} valor={d.total} max={maxIngresoDia} formato={(v) => `Bs ${v.toFixed(2)}`} />
              ))
            )}
          </div>

          <div className="siih-card p-5 lg:col-span-2">
            <p className="font-display text-lg text-ink mb-4">Medicamentos más dispensados</p>
            {medicamentos.length === 0 ? (
              <p className="text-sm text-inksoft">Sin dispensaciones registradas.</p>
            ) : (
              medicamentos.map((m) => (
                <Barra key={m.medicamento} label={m.medicamento} valor={m.cantidad_dispensada} max={maxMed} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
