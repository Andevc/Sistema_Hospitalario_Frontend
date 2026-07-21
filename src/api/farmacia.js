import { client } from './client'

export const farmaciaApi = {
  listarMedicamentos: () => client.get('/farmacia/medicamentos').then((r) => r.data),
  alertasStock: () => client.get('/farmacia/medicamentos/alertas-stock').then((r) => r.data),
  dispensar: (data) => client.post('/farmacia/dispensar', data).then((r) => r.data),
}
