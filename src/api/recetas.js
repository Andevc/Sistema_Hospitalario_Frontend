import { client } from './client'

export const recetasApi = {
  crear: (data) => client.post('/recetas/', data).then((r) => r.data),
  listar: () => client.get('/recetas/').then((r) => r.data),
  obtener: (id) => client.get(`/recetas/${id}`).then((r) => r.data),
  actualizar: (id, data) => client.put(`/recetas/${id}`, data).then((r) => r.data),
}
