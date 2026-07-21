// Reutiliza el semáforo de triaje (Rojo/Amarillo/Verde) como lenguaje de
// estado en toda la app, en vez de inventar un esquema de colores nuevo.
const MAPA = {
  // verdes: activo, disponible, resuelto, pagada
  activo: 'verde',
  activa: 'verde',
  disponible: 'verde',
  resuelto: 'verde',
  atendida: 'verde',
  pagada: 'verde',
  alta: 'verde',
  verde: 'verde',
  completado: 'verde',
  // amarillos: pendiente, en curso, ocupada
  pendiente: 'amarillo',
  'en triaje': 'amarillo',
  'en atención': 'amarillo',
  ocupada: 'amarillo',
  amarillo: 'amarillo',
  emitida: 'amarillo',
  // rojos: urgente, cancelada, crítico
  cancelada: 'rojo',
  cancelado: 'rojo',
  rojo: 'rojo',
  critico: 'rojo',
  crítico: 'rojo',
  mantenimiento: 'rojo',
}

export default function StatusBadge({ value }) {
  if (!value) return <span className="siih-badge siih-badge-neutro">—</span>
  const key = String(value).toLowerCase()
  const tono = MAPA[key] || 'neutro'
  return <span className={`siih-badge siih-badge-${tono}`}>{value}</span>
}
