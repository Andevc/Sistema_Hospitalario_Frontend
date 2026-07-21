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
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="citas" element={<Citas />} />
            <Route path="historia-clinica" element={<HistoriaClinica />} />
            <Route path="laboratorio" element={<Laboratorio />} />
            <Route path="recetas" element={<Recetas />} />
            <Route path="hospitalizacion" element={<Hospitalizacion />} />
            <Route path="emergencia" element={<Emergencia />} />
            <Route path="farmacia" element={<Farmacia />} />
            <Route path="facturacion" element={<Facturacion />} />
            <Route path="reportes" element={<Reportes />} />
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
