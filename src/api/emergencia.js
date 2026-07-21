import { client } from './client'

export const emergenciaApi = {
  registrarIngreso: (data) => client.post('/emergencias/', data).then((r) => r.data),
  listar: (solo_activas = false) =>
    client.get('/emergencias/', { params: { solo_activas } }).then((r) => r.data),
  obtener: (id) => client.get(`/emergencias/${id}`).then((r) => r.data),
  vincularPaciente: (id, data) =>
    client.patch(`/emergencias/${id}/paciente`, data).then((r) => r.data),
  cambiarEstado: (id, data) =>
    client.patch(`/emergencias/${id}/estado`, data).then((r) => r.data),
  registrarTriaje: (id, data) =>
    client.post(`/emergencias/${id}/triaje`, data).then((r) => r.data),
  listarTriajes: (id) => client.get(`/emergencias/${id}/triaje`).then((r) => r.data),
  registrarAtencion: (id, data) =>
    client.post(`/emergencias/${id}/atencion`, data).then((r) => r.data),
  actualizarAtencion: (id, idAtencion, data) =>
    client.put(`/emergencias/${id}/atencion/${idAtencion}`, data).then((r) => r.data),
  listarAtenciones: (id) => client.get(`/emergencias/${id}/atencion`).then((r) => r.data),
}
