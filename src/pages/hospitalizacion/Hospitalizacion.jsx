import { useEffect, useState } from 'react'
import { hospitalizacionApi } from '../../api/hospitalizacion'
import { apiError } from '../../api/client'
import { BedDouble } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import LoadingSpinner from '../../components/LoadingSpinner'
import AlertBanner from '../../components/AlertBanner'
import SidePanel from '../../components/SidePanel'
import StatusBadge from '../../components/StatusBadge'

export default function Hospitalizacion() {
  const [hospitalizaciones, setHospitalizaciones] = useState([])
  const [camas, setCamas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [panelCrear, setPanelCrear] = useState(false)
  const [form, setForm] = useState({ id_cama: '', id_consulta: '', id_atencion_emerg: '', fecha_ingreso: '' })
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const [detalle, setDetalle] = useState(null) // hospitalizacion seleccionada
  const [evoluciones, setEvoluciones] = useState([])
  const [signos, setSignos] = useState([])
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [formEvolucion, setFormEvolucion] = useState({ id_medico: '', descripcion: '' })
  const [formSignos, setFormSignos] = useState({ presion_arterial: '', temperatura: '' })

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const [h, c] = await Promise.all([hospitalizacionApi.listar(), hospitalizacionApi.camasDisponibles()])
      setHospitalizaciones(h)
      setCamas(c)
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
    setForm({ id_cama: '', id_consulta: '', id_atencion_emerg: '', fecha_ingreso: new Date().toISOString().slice(0, 10) })
    setErrorForm('')
    setPanelCrear(true)
  }

  const guardarIngreso = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      await hospitalizacionApi.ingresar({
        id_cama: Number(form.id_cama),
        id_consulta: form.id_consulta ? Number(form.id_consulta) : null,
        id_atencion_emerg: form.id_atencion_emerg ? Number(form.id_atencion_emerg) : null,
        fecha_ingreso: form.fecha_ingreso || null,
      })
      setPanelCrear(false)
      cargar()
    } catch (err) {
      setErrorForm(apiError(err))
    } finally {
      setGuardando(false)
    }
  }

  const abrirDetalle = async (h) => {
    setDetalle(h)
    setCargandoDetalle(true)
    try {
      const [ev, sg] = await Promise.all([
        hospitalizacionApi.listarEvoluciones(h.id_hospitalizacion),
        hospitalizacionApi.listarSignos(h.id_hospitalizacion),
      ])
      setEvoluciones(ev)
      setSignos(sg)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setCargandoDetalle(false)
    }
  }

  const agregarEvolucion = async (e) => {
    e.preventDefault()
    try {
      await hospitalizacionApi.registrarEvolucion(detalle.id_hospitalizacion, {
        id_medico: Number(formEvolucion.id_medico),
        descripcion: formEvolucion.descripcion,
      })
      setFormEvolucion({ id_medico: '', descripcion: '' })
      setEvoluciones(await hospitalizacionApi.listarEvoluciones(detalle.id_hospitalizacion))
    } catch (err) {
      setError(apiError(err))
    }
  }

  const agregarSignos = async (e) => {
    e.preventDefault()
    try {
      await hospitalizacionApi.registrarSignos(detalle.id_hospitalizacion, {
        presion_arterial: formSignos.presion_arterial || null,
        temperatura: formSignos.temperatura ? Number(formSignos.temperatura) : null,
      })
      setFormSignos({ presion_arterial: '', temperatura: '' })
      setSignos(await hospitalizacionApi.listarSignos(detalle.id_hospitalizacion))
    } catch (err) {
      setError(apiError(err))
    }
  }

  const darAlta = async () => {
    if (!window.confirm(`¿Dar de alta a la hospitalización #${detalle.id_hospitalizacion}?`)) return
    try {
      const actualizada = await hospitalizacionApi.alta(detalle.id_hospitalizacion, {})
      setDetalle(actualizada)
      cargar()
    } catch (err) {
      setError(apiError(err))
    }
  }

  return (
    <div>
      <PageHeader
        icon={BedDouble}
        title="Hospitalización"
        subtitle="Ingresos, evolución clínica y signos vitales por cama."
        action={<button className="siih-btn-primary" onClick={abrirCrear}>Registrar ingreso</button>}
      />

      {error && <div className="mb-4"><AlertBanner tone="error">{error}</AlertBanner></div>}

      {cargando ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          rowKey={(r) => r.id_hospitalizacion}
          onRowClick={abrirDetalle}
          emptyLabel="No hay hospitalizaciones registradas."
          columns={[
            { key: 'id_hospitalizacion', header: '#' },
            { key: 'id_cama', header: 'Cama', render: (r) => `#${r.id_cama}` },
            { key: 'fecha_ingreso', header: 'Ingreso' },
            { key: 'estado', header: 'Estado', render: (r) => <StatusBadge value={r.fecha_alta ? 'Alta' : 'Activo'} /> },
          ]}
          rows={hospitalizaciones}
        />
      )}

      <SidePanel open={panelCrear} onClose={() => setPanelCrear(false)} title="Registrar ingreso" subtitle="RF14 / RF15">
        <form onSubmit={guardarIngreso} className="space-y-4">
          {errorForm && <AlertBanner tone="error">{errorForm}</AlertBanner>}
          <div>
            <label className="siih-label">Cama disponible</label>
            <select className="siih-input" required value={form.id_cama} onChange={(e) => setForm({ ...form, id_cama: e.target.value })}>
              <option value="">Selecciona una cama…</option>
              {camas.map((c) => (
                <option key={c.id_cama} value={c.id_cama}>
                  Hab. {c.numero_habitacion} · {c.tipo_cama} · Bs {c.precio_dia}/día
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="siih-label">ID consulta (opcional)</label>
              <input className="siih-input" type="number" value={form.id_consulta} onChange={(e) => setForm({ ...form, id_consulta: e.target.value })} />
            </div>
            <div>
              <label className="siih-label">ID emergencia (opcional)</label>
              <input className="siih-input" type="number" value={form.id_atencion_emerg} onChange={(e) => setForm({ ...form, id_atencion_emerg: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="siih-label">Fecha de ingreso</label>
            <input type="date" className="siih-input" value={form.fecha_ingreso} onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="siih-btn-ghost" onClick={() => setPanelCrear(false)}>Cancelar</button>
            <button type="submit" disabled={guardando} className="siih-btn-primary">{guardando ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </SidePanel>

      <SidePanel
        open={!!detalle}
        onClose={() => setDetalle(null)}
        title={detalle ? `Hospitalización #${detalle.id_hospitalizacion}` : ''}
        subtitle={detalle ? `Cama #${detalle.id_cama} · Ingreso ${detalle.fecha_ingreso}` : ''}
        wide
      >
        {detalle && (
          <div className="space-y-8">
            {!detalle.fecha_alta && (
              <button className="siih-btn-danger" onClick={darAlta}>Dar de alta</button>
            )}
            {detalle.fecha_alta && <AlertBanner tone="ok">Paciente dado de alta el {detalle.fecha_alta}.</AlertBanner>}

            {cargandoDetalle ? (
              <LoadingSpinner />
            ) : (
              <>
                <section>
                  <p className="font-display text-lg text-ink mb-3">Evolución clínica (RF16)</p>
                  <div className="space-y-2 mb-3">
                    {evoluciones.length === 0 && <p className="text-sm text-inksoft">Sin evoluciones registradas.</p>}
                    {evoluciones.map((ev) => (
                      <div key={ev.id_evolucion} className="siih-card p-3 text-sm">
                        <p className="text-xs text-inksoft">{new Date(ev.fecha_hora).toLocaleString('es-BO')} · Médico #{ev.id_medico}</p>
                        <p className="text-ink mt-1">{ev.descripcion}</p>
                      </div>
                    ))}
                  </div>
                  {!detalle.fecha_alta && (
                    <form onSubmit={agregarEvolucion} className="siih-card p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          className="siih-input col-span-1"
                          type="number"
                          placeholder="ID médico"
                          required
                          value={formEvolucion.id_medico}
                          onChange={(e) => setFormEvolucion({ ...formEvolucion, id_medico: e.target.value })}
                        />
                        <textarea
                          className="siih-input col-span-2"
                          rows={1}
                          placeholder="Descripción de la evolución…"
                          required
                          value={formEvolucion.descripcion}
                          onChange={(e) => setFormEvolucion({ ...formEvolucion, descripcion: e.target.value })}
                        />
                      </div>
                      <button className="siih-btn-ghost text-xs" type="submit">Agregar evolución</button>
                    </form>
                  )}
                </section>

                <section>
                  <p className="font-display text-lg text-ink mb-3">Signos vitales (RF17)</p>
                  <div className="space-y-2 mb-3">
                    {signos.length === 0 && <p className="text-sm text-inksoft">Sin registros de signos vitales.</p>}
                    {signos.map((s) => (
                      <div key={s.id_signos} className="siih-card p-3 text-sm flex justify-between">
                        <span className="text-inksoft">{new Date(s.fecha_hora).toLocaleString('es-BO')}</span>
                        <span>{s.presion_arterial || '—'} · {s.temperatura ? `${s.temperatura} °C` : '—'}</span>
                      </div>
                    ))}
                  </div>
                  {!detalle.fecha_alta && (
                    <form onSubmit={agregarSignos} className="siih-card p-3 grid grid-cols-3 gap-2 items-end">
                      <input
                        className="siih-input"
                        placeholder="Presión arterial"
                        value={formSignos.presion_arterial}
                        onChange={(e) => setFormSignos({ ...formSignos, presion_arterial: e.target.value })}
                      />
                      <input
                        className="siih-input"
                        placeholder="Temperatura °C"
                        type="number"
                        step="0.1"
                        value={formSignos.temperatura}
                        onChange={(e) => setFormSignos({ ...formSignos, temperatura: e.target.value })}
                      />
                      <button className="siih-btn-ghost text-xs" type="submit">Registrar</button>
                    </form>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  )
}
