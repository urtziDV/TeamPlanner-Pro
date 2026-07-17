# 📖 Manual de Usuario - ToolTracker v4.0

¡Bienvenido a **ToolTracker v4.0**, el nuevo sistema centralizado para la gestión de activos y equipamiento! 

Este manual te guiará paso a paso para que domines todas las secciones y características de la aplicación. Gracias a su nuevo diseño, verás que la navegación es extremadamente intuitiva, rápida y agradable a la vista.

---

## 🗂️ 1. Navegación Principal (Sidebar)
En la parte izquierda de tu pantalla encontrarás el menú principal. Puedes ocultarlo o cambiar entre Modo Claro ☀️ y Modo Oscuro 🌙 desde el panel inferior del menú. 

### Secciones disponibles:
- **Dashboard:** Resumen global y estadísticas.
- **Inventario:** Tu catálogo de herramientas.
- **Préstamos:** Registro de quién tiene qué.
- **Solicitudes:** Buzón de peticiones de herramientas.
- **Vehículos:** Gestión de flota.
- **Incidentes:** Historial de averías y problemas.
- **Recordatorios, Categorías, Proyectos y Usuarios:** Tablas maestras.
- **Ajustes:** Configuración avanzada y copias de seguridad.

---

## 📊 2. Dashboard
El punto de entrada de la aplicación. Aquí verás:
- **Tarjetas superiores:** Un vistazo rápido al total de herramientas Disponibles, Prestadas y Averiadas.
- **Gráfica Visual:** Un gráfico interactivo que te muestra el porcentaje del inventario según su estado (Disponible, Prestada, Averiada).
- **Últimos Incidentes:** Un feed con las incidencias más recientes para que no se te escape nada.

---

## 📦 3. Inventario
El núcleo del sistema. Aquí puedes ver, buscar, crear y eliminar herramientas.
- **Vistas:** Puedes alternar entre vista de **Cuadrícula** (tarjetas visuales grandes) o vista de **Lista** (modo tabla compacto) usando los botones de la esquina superior derecha.
- **Tarjetas de Herramienta:** Cada tarjeta muestra la miniatura de la herramienta, su número de serie (SN) y etiquetas que indican su estado.
- **Editar:** Pasa el ratón sobre una herramienta y pulsa en el botón de "Editar" (lápiz) para abrir un menú emergente vistoso donde puedes actualizar su información o marcarla como Genérica, Básica o de Proyecto.

---

## 🤝 4. Préstamos (Loans)
Controla quién se ha llevado material y cuándo.
- Las asignaciones activas muestran **quién** tiene la herramienta, **qué** herramienta es (con su imagen), y la **fecha de entrega**.
- **Devolver una herramienta:** Para registrar que un empleado ha devuelto un equipo, pasa el ratón sobre su tarjeta y haz clic en el botón de **Retornar**. Si la herramienta ha vuelto dañada, el sistema te permitirá registrarlo directamente como un incidente.

---

## 📬 5. Solicitudes
Cuando un empleado o departamento necesita una herramienta que no tiene asignada, la solicitud aparecerá aquí.
- Las solicitudes se agrupan de forma inteligente por la herramienta demandada.
- Al hacer clic en el grupo de una herramienta, verás un popup con la miniatura del equipo y la lista de empleados que la han solicitado.
- Desde ahí puedes aprobar la entrega (generando un préstamo automático) o rechazar/eliminar la solicitud si no procede.

---

## ⚠️ 6. Incidentes
Un historial vitalicio de qué ha pasado con los equipos (roturas, pérdidas, mantenimientos).
- Puedes registrar nuevos incidentes de forma manual.
- Selecciona el tipo de problema, la herramienta implicada, y añade una descripción detallada. Esto nos permite tener trazabilidad de equipos problemáticos.

---

## 👥 7. Tablas Maestras (Usuarios, Vehículos, etc.)
- **Usuarios (Empleados):** Listado del personal. Puedes añadir nuevos empleados, asignarles un departamento, un correo y un teléfono. Si un empleado deja la empresa, puedes borrarlo desde aquí.
- **Proyectos:** Lista de las obras y proyectos activos. Sirven para etiquetar herramientas que se envían a un proyecto específico.
- **Vehículos:** Añade furgonetas o coches de empresa con sus respectivas matrículas para tener un control sobre la flota asignada.

---

## ⚙️ 8. Ajustes
El centro de control del sistema:
- **Apariencia:** Fuerzale a la app el modo claro, oscuro, o que siga la preferencia del sistema operativo.
- **Copia de Seguridad (Backup):** Haz clic en "Descargar" para bajarte un archivo `.db` con toda la base de datos actual. ¡Se recomienda hacerlo de forma regular!
- **Rutas y Configuraciones:** Define la ruta donde se guardan automáticamente las copias de seguridad en tu servidor y mantén un ciclo de rotación (ej. guardar solo las 5 últimas copias).

---

## 💡 Trucos de Uso (Tips)
1. **Búsqueda global:** Utiliza la barra de "Buscar..." que está presente en casi todas las pantallas para filtrar rápidamente por Nombre, SN o Empleado.
2. **Imágenes reales:** Intenta añadir una URL de imagen válida en el inventario para cada equipo. ¡La app lucirá infinitamente mejor y será más fácil localizar el material físicamente!
3. **Optimización de espacio:** Utiliza siempre la vista de lista (List view) si estás trabajando en un portátil pequeño y necesitas ver muchos registros a la vez.

¡Disfruta de ToolTracker v4.0! 🚀
