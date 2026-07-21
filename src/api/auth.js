import { client } from './client'

export const authApi = {
  login: (nombre_usuario, password) =>
    client.post('/auth/login', { nombre_usuario, password }).then((r) => r.data),
  registro: (data) => client.post('/auth/registro', data).then((r) => r.data),
  roles: () => client.get('/auth/roles').then((r) => r.data),
  yo: () => client.get('/auth/yo').then((r) => r.data),
  listarUsuarios: () => client.get('/auth/usuarios').then((r) => r.data),
  actualizarUsuario: (id, data) =>
    client.put(`/auth/usuarios/${id}`, data).then((r) => r.data),
}
