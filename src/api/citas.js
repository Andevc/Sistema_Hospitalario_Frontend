import { client } from './client'

export const citasApi = {
  especialidades: () => client.get('/citas/especialidades').then((r) => r.data),
  medicosDisponibles: (id_especialidad) =>
    client
      .get('/citas/medicos-disponibles', { params: { id_especialidad } })
      .then((r) => r.data),
  disponibilidad: (id_medico, fecha_hora) =>
    client
      .get('/citas/disponibilidad', { params: { id_medico, fecha_hora } })
      .then((r) => r.data),
  crear: (data) => client.post('/citas/', data).then((r) => r.data),
  listar: () => client.get('/citas/').then((r) => r.data),
  obtener: (id) => client.get(`/citas/${id}`).then((r) => r.data),
  actualizar: (id, data) => client.put(`/citas/${id}`, data).then((r) => r.data),
  cancelar: (id) => client.patch(`/citas/${id}/cancelar`).then((r) => r.data),
}
