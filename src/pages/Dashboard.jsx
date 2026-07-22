import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Siren,
  PackageMinus,
  BedDouble,
  ClipboardPlus,
  Stethoscope,
  Pill as PillIcon,
  Receipt,
  ArrowRight,
} from 'lucide-react'
import { citasApi } from '../api/citas'
import { emergenciaApi } from '../api/emergencia'
import { farmaciaApi } from '../api/farmacia'
import { hospitalizacionApi } from '../api/hospitalizacion'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const TONOS = {
  brand: { text: 'text-brand', bg: 'bg-brand-soft', iconText: 'text-brand' },
  rojo: { text: 'text-triaje-rojo', bg: 'bg-triaje-rojoSoft', iconText: 'text-triaje-rojo' },
  amarillo: { text: 'text-triaje-amarillo', bg: 'bg-triaje-amarilloSoft', iconText: 'text-triaje-amarillo' },
  verde: { text: 'text-triaje-verde', bg: 'bg-triaje-verdeSoft', iconText: 'text-triaje-verde' },
}

function Metric({ to, label, value, tone, icon: Icon }) {
  const t = TONOS[tone] || TONOS.brand
  return (
    <Link to={to} className="siih-card p-5 hover:border-brand/40 hover:shadow-md transition group block">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-inksoft font-medium">{label}</p>
        <div className={`h-8 w-8 rounded-md2 flex items-center justify-center ${t.bg}`}>
          <Icon size={16} className={t.iconText} />
        </div>
      </div>
      <div className="flex items-end justify-between mt-2">
        <p className={`font-display text-4xl ${t.text}`}>{value}</p>
        <ArrowRight size={16} className="text-inksoft/0 group-hover:text-inksoft/50 transition mb-1.5" />
      </div>
    </Link>
  )
}

const PASOS = [
  { icon: ClipboardPlus, titulo: 'Recepción', texto: 'Registra pacientes y programa citas.' },
  { icon: Stethoscope, titulo: 'Atención', texto: 'Consultas, laboratorio, recetas, hospitalización y emergencias.' },
  { icon: PillIcon, titulo: 'Farmacia', texto: 'Dispensa según receta y controla el stock.' },
  { icon: Receipt, titulo: 'Administración', texto: 'Consolida facturación y reportes por periodo.' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [datos, setDatos] = useState({
    citasPendientes: 0,
    emergenciasActivas: 0,
    stockBajo: 0,
    camasDisponibles: 0,
  })

  useEffect(() => {
    let activo = true
    async function cargar() {
      const resultados = await Promise.allSettled([
        citasApi.listar(),
        emergenciaApi.listar(true),
        farmaciaApi.alertasStock(),
        hospitalizacionApi.camasDisponibles(),
      ])
      if (!activo) return
      const [citas, emergencias, alertas, camas] = resultados
      setDatos({
        citasPendientes:
          citas.status === 'fulfilled' ? citas.value.filter((c) => c.estado === 'Pendiente').length : 0,
        emergenciasActivas: emergencias.status === 'fulfilled' ? emergencias.value.length : 0,
        stockBajo: alertas.status === 'fulfilled' ? alertas.value.length : 0,
        camasDisponibles: camas.status === 'fulfilled' ? camas.value.length : 0,
      })
      setCargando(false)
    }
    cargar()
    return () => {
      activo = false
    }
  }, [])

  return (
    <div>
      <PageHeader
        title={`Hola, ${user?.nombre_usuario}`}
        subtitle={`Sesión activa como ${user?.rol}. Vista general del hospital hoy.`}
      />
      {cargando ? (
        <LoadingSpinner label="Cargando panel general…" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric to="/citas" label="Citas pendientes" value={datos.citasPendientes} tone="brand" icon={CalendarDays} />
          <Metric to="/emergencia" label="Emergencias activas" value={datos.emergenciasActivas} tone="rojo" icon={Siren} />
          <Metric to="/farmacia" label="Stock bajo" value={datos.stockBajo} tone="amarillo" icon={PackageMinus} />
          <Metric to="/hospitalizacion" label="Camas disponibles" value={datos.camasDisponibles} tone="verde" icon={BedDouble} />
        </div>
      )}

      <div className="mt-8 siih-card p-6">
        <p className="font-display text-lg text-ink mb-4">Flujo del sistema</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PASOS.map((paso, i) => {
            const Icon = paso.icon
            return (
              <div key={paso.titulo} className="relative flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{paso.titulo}</p>
                  <p className="text-xs text-inksoft leading-relaxed mt-0.5">{paso.texto}</p>
                </div>
                {i < PASOS.length - 1 && (
                  <ArrowRight size={14} className="hidden lg:block text-line absolute -right-5 top-2.5" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
