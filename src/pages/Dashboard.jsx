import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { citasApi } from '../api/citas'
import { emergenciaApi } from '../api/emergencia'
import { farmaciaApi } from '../api/farmacia'
import { hospitalizacionApi } from '../api/hospitalizacion'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'

function Metric({ to, label, value, tone }) {
  const tonos = {
    verde: 'text-triaje-verde',
    amarillo: 'text-triaje-amarillo',
    rojo: 'text-triaje-rojo',
    brand: 'text-brand',
  }
  return (
    <Link to={to} className="siih-card p-5 hover:border-brand/40 transition block">
      <p className="text-xs uppercase tracking-wide text-inksoft font-medium">{label}</p>
      <p className={`font-display text-4xl mt-2 ${tonos[tone] || 'text-ink'}`}>{value}</p>
    </Link>
  )
}

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
          <Metric to="/citas" label="Citas pendientes" value={datos.citasPendientes} tone="brand" />
          <Metric to="/emergencia" label="Emergencias activas" value={datos.emergenciasActivas} tone="rojo" />
          <Metric to="/farmacia" label="Medicamentos con stock bajo" value={datos.stockBajo} tone="amarillo" />
          <Metric to="/hospitalizacion" label="Camas disponibles" value={datos.camasDisponibles} tone="verde" />
        </div>
      )}
      <div className="mt-8 siih-card p-6">
        <p className="font-display text-lg text-ink mb-2">Flujo del sistema</p>
        <p className="text-sm text-inksoft leading-relaxed">
          Recepción registra pacientes y programa citas. El área de Atención cubre consultas,
          laboratorio, recetas, hospitalización y emergencias. Farmacia dispensa según receta y
          controla stock. Administración consolida facturación y reportes por periodo.
        </p>
      </div>
    </div>
  )
}
