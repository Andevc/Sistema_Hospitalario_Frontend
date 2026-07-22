import { useEffect, useMemo, useState } from 'react'
import { emergenciaApi } from '../../api/emergencia'
import { pacientesApi } from '../../api/pacientes'
import { citasApi } from '../../api/citas'
import { apiError } from '../../api/client'
import { Siren } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'
import StatusBadge from '../../components/StatusBadge'

const PRIORIDADES = ['Rojo', 'Amarillo', 'Verde']

export default function Emergencia() {
  const [emergencias, setEmergencias] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [soloActivas, setSoloActivas] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [panelCrear, setPanelCrear] = useState(false)
  const [formIngreso, setFormIngreso] = useState({ id_paciente: '' })
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const [detalle, setDetalle] = useState(null)
  const [triajes, setTriajes] = useState([])
  const [atenciones, setAtenciones] = useState([])
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [formVincular, setFormVincular] = useState('')
  const [formTriaje, setFormTriaje] = useState({ prioridad: 'Verde', presion: '', temperatura: '', frecuencia_cardiaca: '', saturacion: '' })
  const [formAtencion, setFormAtencion] = useState({ id_medico: '', diagnostico_presuntivo: '', procedimientos_realizados: '' })

  const mapaPacientes = useMemo(() => {
    const m = {}
    pacientes.forEach((p) => (m[p.id_paciente] = p.nombre_completo))
    return m
  }, [pacientes])

  const mapaMedicos = useMemo(() => {
    const m = {}
    medicos.forEach((doc) => (m[doc.id_medico] = doc.nombre_usuario))
    return m
  }, [medicos])

  const cargar = async (activasFlag = soloActivas) => {
    setCargando(true)
    setError('')
    try {
      const [e, p, ml] = await Promise.all([
        emergenciaApi.listar(activasFlag),
        pacientesApi.listar(),
        citasApi.medicos(),
      ])
      setEmergencias(e)
      setPacientes(p)
      setMedicos(ml)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar(soloActivas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloActivas])

  const abrirCrear = () => {
    setFormIngreso({ id_paciente: '' })
    setErrorForm('')
    setPanelCrear(true)
  }

  const guardarIngreso = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      await emergenciaApi.registrarIngreso({ id_paciente: formIngreso.id_paciente ? Number(formIngreso.id_paciente) : null })
      setPanelCrear(false)
      cargar()
    } catch (err) {
      setErrorForm(apiError(err))
    } finally {
      setGuardando(false)
    }
  }

  const abrirDetalle = async (em) => {
    setDetalle(em)
    setCargandoDetalle(true)
    setFormVincular('')
    try {
      const [t, a] = await Promise.all([emergenciaApi.listarTriajes(em.id_emergencia), emergenciaApi.listarAtenciones(em.id_emergencia)])
      setTriajes(t)
      setAtenciones(a)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargandoDetalle(false)
    }
  }

  const vincularPaciente = async (e) => {
    e.preventDefault()
    try {
      const actualizada = await emergenciaApi.vincularPaciente(detalle.id_emergencia, { id_paciente: Number(formVincular) })
      setDetalle(actualizada)
      cargar()
    } catch (err) {
      setError(apiError(err))
    }
  }

  const cambiarEstado = async (estado) => {
    try {
      const actualizada = await emergenciaApi.cambiarEstado(detalle.id_emergencia, { estado })
      setDetalle(actualizada)
      cargar()
    } catch (err) {
      setError(apiError(err))
    }
  }

  const agregarTriaje = async (e) => {
    e.preventDefault()
    try {
      await emergenciaApi.registrarTriaje(detalle.id_emergencia, {
        prioridad: formTriaje.prioridad,
        presion: formTriaje.presion || null,
        temperatura: formTriaje.temperatura ? Number(formTriaje.temperatura) : null,
        frecuencia_cardiaca: formTriaje.frecuencia_cardiaca ? Number(formTriaje.frecuencia_cardiaca) : null,
        saturacion: formTriaje.saturacion ? Number(formTriaje.saturacion) : null,
      })
      setTriajes(await emergenciaApi.listarTriajes(detalle.id_emergencia))
    } catch (err) {
      setError(apiError(err))
    }
  }

  const agregarAtencion = async (e) => {
    e.preventDefault()
    try {
      await emergenciaApi.registrarAtencion(detalle.id_emergencia, {
        id_medico: Number(formAtencion.id_medico),
        diagnostico_presuntivo: formAtencion.diagnostico_presuntivo || null,
        procedimientos_realizados: formAtencion.procedimientos_realizados || null,
      })
      setFormAtencion({ id_medico: '', diagnostico_presuntivo: '', procedimientos_realizados: '' })
      setAtenciones(await emergenciaApi.listarAtenciones(detalle.id_emergencia))
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <div>
      <PageHeader
        icon={Siren}
        title="Emergencia"
        subtitle="Ingreso, triaje y atención inmediata (RF19-RF21)."
        action={<button className="siih-btn-primary" onClick={abrirCrear}>Registrar ingreso</button>}
      />

      <label className="flex items-center gap-2 text-sm text-inksoft mb-4">
        <input type="checkbox" checked={soloActivas} onChange={(e) => setSoloActivas(e.target.checked)} />
        Mostrar solo emergencias activas
      </label>

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_emergencia}
          onRowClick={abrirDetalle}
          emptyLabel="No hay emergencias registradas."
          columns={[
            { key: 'id_emergencia', header: '#' },
            { key: 'id_paciente', header: 'Paciente', render: (r) => (r.id_paciente ? mapaPacientes[r.id_paciente] || `#${r.id_paciente}` : 'NN (sin identificar)') },
            { key: 'fecha_hora_ingreso', header: 'Ingreso', render: (r) => new Date(r.fecha_hora_ingreso).toLocaleString('es-BO') },
            { key: 'estado', header: 'Estado', render: (r) => <StatusBadge value={r.estado} /> },
          ]}
          rows={emergencias}
        />
      )}

      <SidePanel open={panelCrear} onClose={() => setPanelCrear(false)} title="Registrar ingreso por emergencia" subtitle="Selecciona el paciente a ingresar.">
        <form onSubmit={guardarIngreso} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}
          <div>
            <label className="siih-label">Paciente (opcional)</label>
            <select className="siih-input" value={formIngreso.id_paciente} onChange={(e) => setFormIngreso({ id_paciente: e.target.value })}>
              <option value="">Sin identificar (NN) — se vincula después</option>
              {pacientes.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.nombre_completo} — CI {p.ci}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="siih-btn-ghost" onClick={() => setPanelCrear(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="siih-btn-primary">{guardando ? 'Guardando…' : 'Registrar'}</button>
          </div>
        </form>
      </SidePanel>

      <SidePanel
        open={!!detalle}
        onClose={() => setDetalle(null)}
        title={detalle ? `Emergencia #${detalle.id_emergencia}` : ''}
        subtitle={detalle ? <StatusBadge value={detalle.estado} /> : ''}
        wide
      >
        {detalle && (
          <div className="space-y-8">
            {!detalle.id_paciente && (
              <form onSubmit={vincularPaciente} className="siih-card p-3 space-y-2">
                <p className="text-sm font-medium text-ink">Vincular paciente NN</p>
                <select className="siih-input" required value={formVincular} onChange={(e) => setFormVincular(e.target.value)}>
                  <option value="">Selecciona paciente…</option>
                  {pacientes.map((p) => (
                    <option key={p.id_paciente} value={p.id_paciente}>{p.nombre_completo} — CI {p.ci}</option>
                  ))}
                </select>
                <button className="siih-btn-ghost text-xs" type="submit">Vincular</button>
              </form>
            )}

            <div className="flex gap-2">
              {['Activa', 'Resuelto', 'Cancelada'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => cambiarEstado(estado)}
                  className={`siih-btn text-xs ${detalle.estado === estado ? 'siih-btn-primary' : 'siih-btn-ghost'}`}
                >
                  {estado}
                </button>
              ))}
            </div>

            {cargandoDetalle ? (
              <LoadingSpinner />
            ) : (
              <>
                <section>
                  <p className="font-display text-lg text-ink mb-3">Triaje (RF20)</p>
                  <div className="space-y-2 mb-3">
                    {triajes.length === 0 && <p className="text-sm text-inksoft">Sin triaje registrado.</p>}
                    {triajes.map((t) => (
                      <div key={t.id_triaje} className="siih-card p-3 text-sm flex items-center justify-between">
                        <StatusBadge value={t.prioridad} />
                        <span className="text-inksoft text-xs">
                          {t.presion || '—'} · {t.frecuencia_cardiaca ? `${t.frecuencia_cardiaca} lpm` : '—'} · {t.saturacion ? `${t.saturacion}% SpO2` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={agregarTriaje} className="siih-card p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <select className="siih-input" value={formTriaje.prioridad} onChange={(e) => setFormTriaje({ ...formTriaje, prioridad: e.target.value })}>
                        {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <input className="siih-input" placeholder="Presión" value={formTriaje.presion} onChange={(e) => setFormTriaje({ ...formTriaje, presion: e.target.value })} />
                      <input className="siih-input" placeholder="Temperatura °C" type="number" step="0.1" value={formTriaje.temperatura} onChange={(e) => setFormTriaje({ ...formTriaje, temperatura: e.target.value })} />
                      <input className="siih-input" placeholder="FC (lpm)" type="number" value={formTriaje.frecuencia_cardiaca} onChange={(e) => setFormTriaje({ ...formTriaje, frecuencia_cardiaca: e.target.value })} />
                      <input className="siih-input" placeholder="Saturación %" type="number" value={formTriaje.saturacion} onChange={(e) => setFormTriaje({ ...formTriaje, saturacion: e.target.value })} />
                    </div>
                    <button className="siih-btn-ghost text-xs" type="submit">Registrar triaje</button>
                  </form>
                </section>

                <section>
                  <p className="font-display text-lg text-ink mb-3">Atención médica (RF21)</p>
                  <div className="space-y-2 mb-3">
                    {atenciones.length === 0 && <p className="text-sm text-inksoft">Sin atención registrada.</p>}
                    {atenciones.map((a) => (
                      <div key={a.id_atencion_emerg} className="siih-card p-3 text-sm">
                        <p className="text-xs text-inksoft">Médico: {mapaMedicos[a.id_medico] || `#${a.id_medico}`}</p>
                        <p className="text-ink mt-1">{a.diagnostico_presuntivo || 'Diagnóstico pendiente'}</p>
                        {a.procedimientos_realizados && <p className="text-inksoft text-xs mt-1">{a.procedimientos_realizados}</p>}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={agregarAtencion} className="siih-card p-3 space-y-2">
                    <select
                      className="siih-input"
                      required
                      value={formAtencion.id_medico}
                      onChange={(e) => setFormAtencion({ ...formAtencion, id_medico: e.target.value })}
                    >
                      <option value="">Selecciona médico…</option>
                      {medicos.map((m) => (
                        <option key={m.id_medico} value={m.id_medico}>
                          {m.nombre_usuario} (Colegiatura {m.nro_colegiatura})
                        </option>
                      ))}
                    </select>
                    <textarea className="siih-input" rows={2} placeholder="Diagnóstico presuntivo" value={formAtencion.diagnostico_presuntivo} onChange={(e) => setFormAtencion({ ...formAtencion, diagnostico_presuntivo: e.target.value })} />
                    <textarea className="siih-input" rows={2} placeholder="Procedimientos realizados" value={formAtencion.procedimientos_realizados} onChange={(e) => setFormAtencion({ ...formAtencion, procedimientos_realizados: e.target.value })} />
                    <button className="siih-btn-ghost text-xs" type="submit">Registrar atención</button>
                  </form>
                </section>
              </>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  )
}
