import { client } from './client'

export const laboratorioApi = {
  crear: (data) => client.post('/laboratorio/', data).then((r) => r.data),
  listar: () => client.get('/laboratorio/').then((r) => r.data),
  obtener: (id) => client.get(`/laboratorio/${id}`).then((r) => r.data),
  actualizar: (id, data) => client.put(`/laboratorio/${id}`, data).then((r) => r.data),
  tiposExamen: () => client.get('/laboratorio/tipos-examen').then((r) => r.data),
}
