import { client } from './client'

export const historiaClinicaApi = {
  crearConsulta: (data) => client.post('/historia-clinica/consultas', data).then((r) => r.data),
  historialPaciente: (id_paciente) =>
    client.get(`/historia-clinica/paciente/${id_paciente}`).then((r) => r.data),
  obtenerConsulta: (id_consulta) =>
    client.get(`/historia-clinica/consulta/${id_consulta}`).then((r) => r.data),
  actualizarConsulta: (id_consulta, data) =>
    client.put(`/historia-clinica/consulta/${id_consulta}`, data).then((r) => r.data),
}
