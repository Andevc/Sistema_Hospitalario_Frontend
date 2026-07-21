# SIIH · Frontend

Frontend en React + Vite para el backend [`Sistema_Hospitalario`](https://github.com/Andevc/Sistema_Hospitalario) (FastAPI). Cubre los 11 módulos del backend: Autenticación/Usuarios, Pacientes, Citas, Historia Clínica, Laboratorio, Recetas, Hospitalización, Emergencia, Farmacia, Facturación y Reportes.

## Requisitos

- Node.js 18+
- pnpm (`npm install -g pnpm` si no lo tienes)
- El backend `Sistema_Hospitalario` corriendo (por defecto en `http://localhost:8000`)

## Puesta en marcha

```bash
pnpm install
cp .env.example .env   # ajusta VITE_API_URL si tu backend no está en localhost:8000
pnpm dev
```

Abre `http://localhost:5173`.

## ⚠️ CORS en el backend

El backend actual **no tiene configurado CORS**, así que el navegador bloqueará las peticiones del frontend. Agrega esto en `app/main.py`, antes de registrar los routers:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # o ["*"] solo en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Estructura

```
src/
  api/            # un archivo por módulo del backend (axios + endpoints)
  context/        # AuthContext (JWT en localStorage)
  components/     # Layout, DataTable, SidePanel, StatusBadge, etc.
  pages/          # una carpeta por módulo funcional
```

## Notas de diseño

- El semáforo de triaje de Emergencia (Rojo/Amarillo/Verde) se reutiliza como
  lenguaje de estado en toda la app (`StatusBadge`), en vez de un esquema
  genérico de colores por módulo.
- Los formularios de creación/edición se abren en un panel lateral
  (`SidePanel`) para no perder el contexto de la lista.
- El login guarda el JWT devuelto por `/auth/login` en `localStorage` y lo
  adjunta automáticamente a cada request vía interceptor de axios.

## Build de producción

```bash
pnpm build
pnpm preview
```
