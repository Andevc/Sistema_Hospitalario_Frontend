import { client } from './client'

export const pacientesApi = {
  crear: (data) => client.post('/pacientes/', data).then((r) => r.data),
  listar: () => client.get('/pacientes/').then((r) => r.data),
  buscarPorCi: (ci) => client.get(`/pacientes/ci/${ci}`).then((r) => r.data),
  obtener: (id) => client.get(`/pacientes/${id}`).then((r) => r.data),
  actualizar: (id, data) => client.put(`/pacientes/${id}`, data).then((r) => r.data),
}
