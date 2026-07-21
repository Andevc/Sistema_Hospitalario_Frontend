import { client } from './client'

export const hospitalizacionApi = {
  camasDisponibles: () => client.get('/hospitalizaciones/camas-disponibles').then((r) => r.data),
  ingresar: (data) => client.post('/hospitalizaciones/', data).then((r) => r.data),
  listar: () => client.get('/hospitalizaciones/').then((r) => r.data),
  obtener: (id) => client.get(`/hospitalizaciones/${id}`).then((r) => r.data),
  alta: (id, data) => client.patch(`/hospitalizaciones/${id}/alta`, data).then((r) => r.data),
  registrarEvolucion: (id, data) =>
    client.post(`/hospitalizaciones/${id}/evoluciones`, data).then((r) => r.data),
  listarEvoluciones: (id) =>
    client.get(`/hospitalizaciones/${id}/evoluciones`).then((r) => r.data),
  registrarSignos: (id, data) =>
    client.post(`/hospitalizaciones/${id}/signos-vitales`, data).then((r) => r.data),
  listarSignos: (id) =>
    client.get(`/hospitalizaciones/${id}/signos-vitales`).then((r) => r.data),
}
