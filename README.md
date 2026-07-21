# SIIH · Guía de uso del Frontend

Guía completa de uso para el frontend del **Sistema Integrado de Información Hospitalaria (SIIH)**, construido en React + Vite y conectado al backend FastAPI [`Sistema_Hospitalario`](https://github.com/Andevc/Sistema_Hospitalario). Cubre las 11 áreas funcionales del sistema: Autenticación/Usuarios, Pacientes, Citas, Historia Clínica, Laboratorio, Recetas, Hospitalización, Emergencia, Farmacia, Facturación y Reportes.

---

## Índice

1. [Requisitos previos](#requisitos-previos)
2. [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
3. [Configuración de CORS en el backend](#configuración-de-cors-en-el-backend)
4. [Conceptos generales de la interfaz](#conceptos-generales-de-la-interfaz)
5. [Inicio de sesión y roles](#inicio-de-sesión-y-roles)
6. [Panel principal (Dashboard)](#panel-principal-dashboard)
7. [Módulo: Pacientes](#módulo-pacientes)
8. [Módulo: Citas](#módulo-citas)
9. [Módulo: Historia Clínica](#módulo-historia-clínica)
10. [Módulo: Laboratorio](#módulo-laboratorio)
11. [Módulo: Recetas](#módulo-recetas)
12. [Módulo: Hospitalización](#módulo-hospitalización)
13. [Módulo: Emergencia](#módulo-emergencia)
14. [Módulo: Farmacia](#módulo-farmacia)
15. [Módulo: Facturación](#módulo-facturación)
16. [Módulo: Reportes](#módulo-reportes)
17. [Módulo: Usuarios (solo Administrador)](#módulo-usuarios-solo-administrador)
18. [Manejo de sesión y errores](#manejo-de-sesión-y-errores)
19. [Build de producción](#build-de-producción)
20. [Estructura del proyecto](#estructura-del-proyecto)

---

## Requisitos previos

- **Node.js 18+**
- **pnpm** (`npm install -g pnpm` si no lo tienes instalado)
- El backend **`Sistema_Hospitalario`** (FastAPI) corriendo y accesible, por defecto en `http://localhost:8000`

## Instalación y puesta en marcha

```bash
# 1. Clonar el repositorio
git clone https://github.com/Andevc/Sistema_Hospitalario_Frontend.git
cd Sistema_Hospitalario_Frontend

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
```

Edita el archivo `.env` si tu backend no corre en `localhost:8000`:

```env
# .env
VITE_API_URL=http://localhost:8000
```

```bash
# 4. Levantar el servidor de desarrollo
pnpm dev
```

Abre el navegador en **`http://localhost:5173`**.

## Configuración de CORS en el backend

El backend no trae CORS habilitado por defecto, por lo que el navegador bloqueará las peticiones del frontend si no se configura. En `app/main.py` del backend, antes de registrar los routers, agrega:

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

Sin este paso, verás errores de red en la consola del navegador aunque el backend esté corriendo correctamente.

---

## Conceptos generales de la interfaz

Antes de entrar módulo por módulo, conviene entender los patrones de interacción que se repiten en toda la aplicación:

- **Barra lateral (sidebar):** agrupa los módulos en 4 bloques — *Recepción* (Pacientes, Citas), *Atención* (Emergencia, Historia clínica, Laboratorio, Recetas, Hospitalización), *Soporte clínico* (Farmacia) y *Administración* (Facturación, Reportes, Usuarios). El módulo **Usuarios** solo aparece si tu rol es **Administrador**.
- **Tablas de datos:** casi todos los módulos muestran un listado en formato tabla. En muchos casos, **hacer clic en una fila abre el panel de edición** de ese registro (no hace falta un botón "editar" aparte).
- **Panel lateral (side panel):** los formularios de creación y edición no cambian de página — se abren en un panel deslizante a la derecha, para no perder de vista la lista de fondo. Se cierra con el botón "Cancelar"/"Cerrar" o haciendo clic fuera del panel.
- **Insignias de estado (`StatusBadge`):** los estados (Pendiente, Activa, Resuelto, Cancelada, Crítico, etc.) se muestran como etiquetas de color. El **semáforo de triaje de Emergencia** (🔴 Rojo / 🟡 Amarillo / 🟢 Verde) se reutiliza como código de color en toda la aplicación en lugar de un esquema de colores distinto por módulo.
- **Mensajes de error:** los errores devueltos por el backend se muestran en un banner rojo (`AlertBanner`) arriba de la tabla o dentro del formulario, con el mensaje de detalle que envía la API.
- **IDs manuales:** algunos formularios (Laboratorio, Recetas, Hospitalización, Emergencia) te piden escribir directamente el ID numérico de un médico, consulta, receta, etc., en lugar de un selector. Esto es así porque el frontend cubre el flujo funcional principal del backend sin duplicar toda la lógica de combos de cada entidad relacionada.

---

## Inicio de sesión y roles

Al abrir la aplicación sin sesión activa, se te redirige automáticamente a **`/login`**.

1. Ingresa tu **nombre de usuario** y **contraseña**.
2. Al iniciar sesión correctamente, el sistema guarda el token JWT (`access_token`) devuelto por `/auth/login` en el `localStorage` del navegador, junto con tus datos básicos (`id_usuario`, `rol`, `nombre_usuario`).
3. Ese token se adjunta automáticamente como cabecera `Authorization: Bearer <token>` en cada petición posterior, mediante un interceptor de Axios — no necesitas volver a autenticarte en cada acción.
4. Si intentabas acceder a una ruta protegida antes de loguearte, al iniciar sesión serás redirigido a esa misma ruta en lugar del dashboard.

**Roles y visibilidad:**

- Cualquier usuario autenticado puede ver y operar los módulos de Recepción, Atención, Soporte clínico y Administración (Facturación, Reportes).
- El módulo **Usuarios** (alta y gestión de cuentas) está restringido al rol **`Administrador`**. Si un usuario sin ese rol intenta acceder a `/usuarios` directamente por URL, verá un mensaje de "No tienes permiso para ver esta sección" en lugar del contenido.

Para cerrar sesión, usa el botón **"Cerrar sesión"** en la esquina superior derecha de cualquier pantalla (junto a tu nombre de usuario y rol).

---

## Panel principal (Dashboard)

Es la pantalla de inicio tras el login (`/`). Muestra 4 indicadores clave, cada uno clicable y que te lleva directo al módulo correspondiente:

| Indicador | Significado | Módulo destino |
|---|---|---|
| **Citas pendientes** | Cantidad de citas con estado "Pendiente" | Citas |
| **Emergencias activas** | Emergencias actualmente sin resolver | Emergencia |
| **Medicamentos con stock bajo** | Medicamentos por debajo de su stock mínimo | Farmacia |
| **Camas disponibles** | Camas libres para hospitalización | Hospitalización |

Debajo de las tarjetas hay un resumen textual del flujo general del sistema: Recepción registra pacientes y agenda citas → Atención cubre consultas, laboratorio, recetas, hospitalización y emergencias → Farmacia dispensa y controla stock → Administración consolida facturación y reportes.

Si alguno de los indicadores no puede cargarse (por ejemplo, por un error de red puntual), el dashboard sigue mostrando el resto con normalidad y ese indicador simplemente se muestra en cero.

---

## Módulo: Pacientes

**Ruta:** `/pacientes`

Registro y ficha básica de pacientes del hospital.

### Ver y buscar pacientes

- Al entrar al módulo se listan todos los pacientes registrados: nombre completo, CI, teléfono, tipo de sangre y fecha de nacimiento.
- Usa el buscador **"Buscar por CI…"** para localizar un paciente específico por su carnet de identidad. Deja el campo vacío y presiona "Buscar" para volver al listado completo.

### Registrar un paciente nuevo

1. Clic en **"Registrar paciente"**.
2. Completa el formulario:
   - **Nombre completo** (obligatorio)
   - **CI** (obligatorio, no editable una vez creado el paciente)
   - **Fecha de nacimiento**
   - **Teléfono**
   - **Contacto de emergencia**
   - **Tipo de sangre** (ej. O+, A-)
   - **Alergias**
   - **Dirección**
3. Clic en **"Guardar"**.

### Editar un paciente existente

- Haz clic en cualquier fila de la tabla para abrir el panel de edición con los datos precargados.
- El campo **CI** queda bloqueado (no se puede modificar) para preservar la identidad del registro; todos los demás campos son editables.

---

## Módulo: Citas

**Ruta:** `/citas`

Programación, reprogramación y cancelación de citas médicas.

### Listado

La tabla muestra, para cada cita: número, paciente (resuelto a nombre), médico (por ID), fecha y hora, estado (`StatusBadge`), y acciones rápidas de **Reprogramar** / **Cancelar**.

### Programar una cita nueva

1. Clic en **"Programar cita"**.
2. Selecciona el **paciente** desde la lista desplegable (se muestra nombre + CI).
3. Selecciona la **especialidad** — esto dispara automáticamente la carga de médicos disponibles para esa especialidad.
4. Selecciona el **médico** (identificado por su número de colegiatura).
5. Elige **fecha y hora**.
6. (Opcional) Clic en **"Verificar disponibilidad"** para consultar en tiempo real si ese médico ya tiene una cita en ese horario. El sistema responde con "Horario libre" (verde) u "Ocupado" (rojo).
7. Clic en **"Guardar"**.

### Reprogramar una cita

- Clic en **"Reprogramar"** en la fila correspondiente. Solo se permite cambiar la **fecha y hora**; paciente y médico no se modifican en este flujo.

### Cancelar una cita

- Clic en **"Cancelar"** en la fila correspondiente. El sistema pide confirmación (`¿Cancelar la cita #N?`) antes de aplicar el cambio. Las citas ya canceladas no muestran esta opción.

---

## Módulo: Historia Clínica

**Ruta:** `/historia-clinica`

Consulta y registro de consultas médicas por paciente.

### Consultar el historial

1. Selecciona un **paciente** en el desplegable superior.
2. Automáticamente se carga su historial de consultas: fecha, médico, motivo y diagnóstico.
3. Si no seleccionas ningún paciente, verás un estado vacío indicando que debes elegir uno primero.

### Registrar una nueva consulta

1. Con un paciente ya seleccionado, clic en **"Registrar consulta"** (deshabilitado hasta elegir paciente).
2. Completa:
   - **ID de cita asociada**
   - **ID médico**
   - **Fecha**
   - **Motivo**
   - **Diagnóstico**
3. Guarda. La consulta aparece inmediatamente en el historial del paciente activo.

### Editar una consulta

- Clic en cualquier fila del historial. En edición solo se pueden modificar **motivo** y **diagnóstico** (los datos de cita, médico, paciente y fecha quedan fijos una vez creada la consulta).

---

## Módulo: Laboratorio

**Ruta:** `/laboratorio`

Gestión de exámenes de laboratorio solicitados y sus resultados.

### Listado

Muestra todos los exámenes con: tipo de examen, **origen** (a qué consulta, emergencia u hospitalización pertenece), resultado (o "Pendiente" si aún no se registró) y fecha de resultado.

### Registrar un examen nuevo

1. Clic en **"Registrar examen"**.
2. Indica el **ID de tipo de examen**.
3. Asocia el examen a **uno** de estos tres orígenes (deja los otros dos vacíos):
   - ID de consulta
   - ID de atención de emergencia
   - ID de hospitalización
4. Define la **fecha de resultado** y, si ya lo tienes, el texto del **resultado**.
5. Guarda.

### Editar un examen (registrar resultado)

- Clic en la fila del examen. En edición solo puedes actualizar **resultado** y **fecha de resultado** — el tipo de examen y su origen quedan fijos. Este es el flujo típico para cuando el laboratorio entrega resultados de un examen que ya estaba pendiente.

---

## Módulo: Recetas

**Ruta:** `/recetas`

Emisión de recetas médicas. La **dispensación física** de la receta se realiza desde el módulo Farmacia, no aquí.

### Listado

Muestra medicamento (por ID), dosis, cantidad prescrita y estado de la receta (`StatusBadge`, por ejemplo Pendiente / Dispensada).

### Emitir una receta nueva

1. Clic en **"Emitir receta"**.
2. Asocia la receta a un origen (opcional, uno de los tres):
   - ID de consulta
   - ID de atención de emergencia
   - ID de hospitalización
3. Completa:
   - **ID de medicamento**
   - **Dosis** (texto libre, ej. "500mg cada 8 horas")
   - **Cantidad**
   - **Indicaciones**
4. Guarda.

### Editar una receta

- Clic en la fila. En edición puedes modificar medicamento, dosis, indicaciones y cantidad (el origen no se puede cambiar).

> 💡 Para completar el ciclo de una receta (marcarla como dispensada y descontar stock), ve al módulo **Farmacia** y usa "Dispensar receta" con el ID de esta receta.

---

## Módulo: Hospitalización

**Ruta:** `/hospitalizacion`

Ingresos hospitalarios, evolución clínica y signos vitales por cama.

### Listado

Muestra número de hospitalización, cama asignada, fecha de ingreso y estado (**Activo** / **Alta**).

### Registrar un ingreso

1. Clic en **"Registrar ingreso"**.
2. Selecciona una **cama disponible** (se muestra número de habitación, tipo de cama y precio por día).
3. (Opcional) Vincula el ingreso a una **consulta** o a una **atención de emergencia** existente mediante su ID.
4. Define la **fecha de ingreso** (por defecto, hoy).
5. Guarda.

### Ver el detalle de una hospitalización

Haz clic en cualquier fila para abrir el panel de detalle, que incluye dos secciones:

**Evolución clínica**
- Lista cronológica de notas de evolución con fecha/hora y médico responsable.
- Formulario para **agregar una nueva evolución**: ID de médico + descripción. Disponible mientras el paciente no haya sido dado de alta.

**Signos vitales**
- Historial de registros de presión arterial y temperatura con fecha/hora.
- Formulario para **registrar nuevos signos vitales** (presión arterial, temperatura en °C). También disponible solo mientras el paciente esté activo.

### Dar de alta

- Dentro del panel de detalle, botón **"Dar de alta"** (visible solo si el paciente sigue activo). Pide confirmación antes de aplicar el cambio. Una vez dado de alta, se muestra un aviso con la fecha de alta y se deshabilitan los formularios de evolución/signos vitales para esa hospitalización.

---

## Módulo: Emergencia

**Ruta:** `/emergencia`

Ingreso, triaje y atención inmediata de pacientes de emergencia. Es el módulo más completo de la aplicación.

### Listado

- Casilla **"Mostrar solo emergencias activas"** (activada por defecto) para filtrar el ruido de casos ya cerrados.
- Cada fila muestra: número, paciente (o **"NN (sin identificar)"** si aún no se vinculó a un registro de paciente), fecha/hora de ingreso y estado.

### Registrar un ingreso por emergencia

1. Clic en **"Registrar ingreso"**.
2. El **paciente es opcional** en este punto: puedes dejarlo como "Sin identificar (NN)" para casos donde la persona llega sin poder dar sus datos, y vincularlo después.
3. Guarda.

### Vincular un paciente NN

- Si una emergencia se registró sin paciente, dentro del panel de detalle aparece un formulario para **vincular** un paciente ya existente por selección de lista. Una vez vinculado, este formulario desaparece.

### Cambiar el estado de la emergencia

- Dentro del detalle, tres botones de estado: **Activa**, **Resuelto**, **Cancelada**. El botón del estado actual aparece resaltado. Cambiar el estado se aplica de inmediato (sin confirmación adicional).

### Triaje

- Historial de triajes registrados, cada uno mostrando su **prioridad** con el semáforo de colores (🔴 Rojo / 🟡 Amarillo / 🟢 Verde) y signos vitales asociados (presión, frecuencia cardíaca, saturación).
- Formulario para **registrar un nuevo triaje**: prioridad (Rojo/Amarillo/Verde), presión arterial, temperatura, frecuencia cardíaca (lpm) y saturación de oxígeno (%). Se pueden registrar varios triajes a lo largo de la atención (por ejemplo, si el estado del paciente cambia).

### Atención médica

- Historial de atenciones registradas: médico responsable, diagnóstico presuntivo y procedimientos realizados.
- Formulario para **agregar una nueva atención**: ID de médico (obligatorio), diagnóstico presuntivo y procedimientos realizados (ambos de texto libre).

---

## Módulo: Farmacia

**Ruta:** `/farmacia`

Inventario de medicamentos y dispensación de recetas.

### Inventario

- Tabla con todos los medicamentos: nombre, stock actual, stock mínimo, precio unitario y un estado visual (**Disponible** / **Crítico**, según si el stock actual está por debajo del mínimo).
- Casilla **"Mostrar solo medicamentos por debajo del stock mínimo"** para filtrar rápidamente las alertas de reabastecimiento. Si no hay ninguno en alerta, se muestra un mensaje de confirmación positivo.

### Dispensar una receta

1. Clic en **"Dispensar receta"**.
2. Ingresa el **ID de la receta** a dispensar.
3. (Opcional) Especifica una **cantidad** distinta a la prescrita originalmente; si se deja vacío, se dispensa la cantidad indicada en la receta.
4. Clic en **"Dispensar"**.
5. El sistema muestra el resultado de la operación: número de receta, nuevo estado, cantidad total dispensada y el **detalle de descuento por lote** (código de lote, cantidad tomada de cada uno y su fecha de vencimiento) — útil para trazabilidad FEFO/FIFO del inventario.

---

## Módulo: Facturación

**Ruta:** `/facturacion`

Consolidación de cargos pendientes por paciente y emisión de facturas. La pantalla está dividida en dos columnas.

### Columna izquierda: generar factura

1. Selecciona un **paciente**. Se cargan automáticamente sus **cargos pendientes** (consultas, exámenes, medicamentos dispensados, días de hospitalización, etc., cada uno con tipo, descripción, cantidad, precio unitario y subtotal).
2. Marca con el **checkbox** los cargos que quieres incluir en la factura. El subtotal seleccionado se recalcula en vivo.
3. Ajusta, si corresponde, **descuento** e **impuesto** (montos en bolivianos).
4. Clic en **"Generar factura"**. El botón indica cuántos ítems se van a facturar.
5. Al generarse, la factura resultante aparece automáticamente en la columna derecha y los cargos ya facturados dejan de aparecer como pendientes.

### Columna derecha: consultar una factura

- Buscador por **número de factura**, para revisar cualquier factura ya emitida (no solo la recién generada).
- La vista de factura muestra: número, paciente, fecha, estado, detalle línea por línea (tipo de servicio, referencia, cantidad, subtotal), y el resumen final: **Subtotal**, **Descuento**, **Impuesto** y **Total**.

---

## Módulo: Reportes

**Ruta:** `/reportes`

Estadísticas operativas del hospital por rango de fechas.

### Generar reportes

1. Define el rango: **Desde** / **Hasta**.
2. Define cuántos elementos mostrar en el ranking de **"Top medicamentos"** (por defecto 5).
3. Clic en **"Generar reportes"**.

### Reportes disponibles

- **Pacientes atendidos por especialidad:** gráfico de barras horizontales comparando el volumen de atención de cada especialidad en el rango elegido.
- **Ingresos por facturación:** monto total facturado en el periodo, más un desglose de ingresos día por día en formato de barras.
- **Medicamentos más dispensados:** ranking (top N configurable) de los medicamentos con mayor cantidad dispensada en el periodo.

Si no hay datos para algún reporte en el rango seleccionado, se muestra un mensaje indicándolo en lugar de un gráfico vacío.

---

## Módulo: Usuarios (solo Administrador)

**Ruta:** `/usuarios` — visible únicamente para el rol **Administrador**.

Alta y gestión de cuentas de acceso al sistema.

### Listado

Muestra usuario, email, rol (resuelto a nombre) y estado (**Activo** / **Inactivo**).

### Crear un usuario nuevo

1. Clic en **"Nuevo usuario"**.
2. Completa:
   - **Nombre de usuario** (obligatorio, no editable después de creado)
   - **Email**
   - **Rol** (lista de roles disponibles del sistema)
   - **Contraseña** (obligatoria al crear)
3. Guarda.

### Editar un usuario

- Clic en la fila correspondiente. Puedes actualizar **email**, **rol** y **estado** (Activo/Inactivo).
- El campo de contraseña se muestra vacío y es **opcional**: solo se actualiza si escribes una nueva; si lo dejas en blanco, la contraseña actual no cambia.

---

## Manejo de sesión y errores

- Todas las peticiones al backend incluyen automáticamente el token JWT guardado en el login.
- Si el backend responde con **401 (no autorizado)** — por ejemplo, porque el token expiró — la aplicación limpia la sesión guardada y redirige automáticamente a `/login`, salvo que ya estés en esa página.
- Los mensajes de error mostrados en pantalla provienen directamente del campo `detail` que devuelve la API FastAPI; si el backend envía múltiples errores de validación, se listan todos separados por " · ".

---

## Build de producción

```bash
pnpm build     # genera la build optimizada en dist/
pnpm preview   # sirve esa build localmente para verificarla
```

Recuerda que la URL del backend en producción (`VITE_API_URL`) debe apuntar a la instancia real del backend, y que ese backend también debe tener configurado CORS para el dominio donde publiques el frontend.

---

## Estructura del proyecto

```
src/
  api/            # un archivo por módulo del backend (axios + endpoints)
                  # auth, pacientes, citas, historiaClinica, laboratorio,
                  # recetas, hospitalizacion, emergencia, farmacia,
                  # facturacion, reportes
  context/        # AuthContext: sesión, JWT en localStorage, control de roles
  components/     # Layout, DataTable, SidePanel, StatusBadge, PageHeader,
                  # AlertBanner, EmptyState, LoadingSpinner, ProtectedRoute
  pages/          # una carpeta por módulo funcional (ver secciones arriba)
```

**Notas de diseño del proyecto:**

- El semáforo de triaje de Emergencia (🔴/🟡/🟢) se reutiliza como lenguaje de estado en toda la app, en lugar de un esquema de colores distinto por módulo.
- Los formularios de creación/edición se abren siempre en un panel lateral para no perder el contexto de la lista de fondo.
- El login guarda el JWT en `localStorage` y lo adjunta automáticamente a cada request vía interceptor de Axios.