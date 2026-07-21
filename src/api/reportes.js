import { client } from './client'

export const reportesApi = {
  pacientesPorEspecialidad: (fecha_inicio, fecha_fin) =>
    client
      .get('/reportes/pacientes-por-especialidad', { params: { fecha_inicio, fecha_fin } })
      .then((r) => r.data),
  ingresos: (fecha_inicio, fecha_fin) =>
    client.get('/reportes/ingresos', { params: { fecha_inicio, fecha_fin } }).then((r) => r.data),
  medicamentosMasDispensados: (top = 5) =>
    client.get('/reportes/medicamentos-mas-dispensados', { params: { top } }).then((r) => r.data),
}
