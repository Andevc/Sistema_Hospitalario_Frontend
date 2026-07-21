import { client } from './client'

export const facturacionApi = {
  cargosPendientes: (id_paciente) =>
    client.get(`/facturacion/pacientes/${id_paciente}/cargos-pendientes`).then((r) => r.data),
  generar: (data) => client.post('/facturacion/generar', data).then((r) => r.data),
  obtener: (id_factura) => client.get(`/facturacion/${id_factura}`).then((r) => r.data),
}
