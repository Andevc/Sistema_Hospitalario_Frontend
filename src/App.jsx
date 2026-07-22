import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/pacientes/Pacientes'
import Citas from './pages/citas/Citas'
import HistoriaClinica from './pages/historiaClinica/HistoriaClinica'
import Laboratorio from './pages/laboratorio/Laboratorio'
import Recetas from './pages/recetas/Recetas'
import Hospitalizacion from './pages/hospitalizacion/Hospitalizacion'
import Emergencia from './pages/emergencia/Emergencia'
import Farmacia from './pages/farmacia/Farmacia'
import Facturacion from './pages/facturacion/Facturacion'
import Reportes from './pages/reportes/Reportes'
import Usuarios from './pages/usuarios/Usuarios'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="pacientes"
              element={
                <ProtectedRoute roles={['Administrador', 'Recepcionista', 'Medico', 'Enfermero']}>
                  <Pacientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="citas"
              element={
                <ProtectedRoute roles={['Administrador', 'Recepcionista', 'Medico', 'Enfermero']}>
                  <Citas />
                </ProtectedRoute>
              }
            />
            <Route
              path="historia-clinica"
              element={
                <ProtectedRoute roles={['Administrador', 'Medico', 'Enfermero']}>
                  <HistoriaClinica />
                </ProtectedRoute>
              }
            />
            <Route
              path="laboratorio"
              element={
                <ProtectedRoute roles={['Administrador', 'Medico', 'Enfermero']}>
                  <Laboratorio />
                </ProtectedRoute>
              }
            />
            <Route
              path="recetas"
              element={
                <ProtectedRoute roles={['Administrador', 'Medico', 'Farmaceutico']}>
                  <Recetas />
                </ProtectedRoute>
              }
            />
            <Route
              path="hospitalizacion"
              element={
                <ProtectedRoute roles={['Administrador', 'Medico', 'Enfermero']}>
                  <Hospitalizacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="emergencia"
              element={
                <ProtectedRoute roles={['Administrador', 'Recepcionista', 'Medico', 'Enfermero']}>
                  <Emergencia />
                </ProtectedRoute>
              }
            />
            <Route
              path="farmacia"
              element={
                <ProtectedRoute roles={['Administrador', 'Farmaceutico', 'Enfermero']}>
                  <Farmacia />
                </ProtectedRoute>
              }
            />
            <Route
              path="facturacion"
              element={
                <ProtectedRoute roles={['Administrador', 'Recepcionista']}>
                  <Facturacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="reportes"
              element={
                <ProtectedRoute roles={['Administrador', 'Medico', 'Recepcionista', 'Enfermero']}>
                  <Reportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute roles={['Administrador']}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
