# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [4.0.2] - 2026-07-17

### Añadido
- **Botón de WhatsApp:** Incorporada la funcionalidad de notificar devoluciones pendientes vía WhatsApp directamente desde la tabla de Recordatorios.
- **Soporte de Stickers QR:** Se han reestructurado los códigos QR generados para que sigan un formato de "pegatina", incluyendo en el propio QR el nombre de la herramienta, el ID interno y el Número de Serie.
- **Descarga Múltiple de QRs:** Si una herramienta tiene múltiples unidades (o múltiples números de serie delimitados por comas), ahora el sistema genera automáticamente un código QR individual para cada unidad.

### Cambiado
- **Menú Superior de Navegación:** Unificados los menús de Inventario y Solicitudes para seguir el mismo diseño consistente del menú de Préstamos.
- **Sincronización de Estados de Herramientas:** Se ha ejecutado una sincronización automática para marcar como "Prestada" cualquier herramienta que cuente con un préstamo activo, corrigiendo inconsistencias.
- **Dropdown de Entregas (Buzón):** Mejorado el desplegable de asignación de herramientas en las Solicitudes para que no muestre la lista kilométrica de Números de Serie, indicando en su lugar "+X más".

### Corregido
- **Recordatorios Perdidos:** Corregido un fallo donde los préstamos sin Estado 'Activa' (por ejemplo, en estado nulo) no se computaban en la pantalla de Recordatorios.

## [4.0.1] - 2026-07-17

### Añadido
- **Configuración Avanzada de Base de Datos:** Se han añadido nuevos controles en el apartado de Ajustes para definir la ruta del archivo de base de datos (`.db`), el directorio local de copias de seguridad y el número de copias de retención.
- **Manual de Usuario:** Creado archivo de documentación con los flujos principales de uso de la aplicación.
- **Visualización en Cuadrícula y Lista:** Controles en las vistas principales (Inventario, Empleados, Préstamos) para alternar dinámicamente entre vista de tarjetas grandes y vista compacta de tabla.

### Cambiado
- **Rediseño de Edición de Herramientas:** Se ha sustituido el antiguo formulario vertical por un diseño moderno de dos columnas, dando máxima prioridad a la previsualización de la miniatura de la herramienta y sus atributos destacados (Genérica, Básica, etc.).
- **Optimización de Solicitudes:** La ventana emergente de solicitudes ahora es más ancha (`max-w-4xl`), muestra la miniatura de la herramienta solicitada en la cabecera y distribuye a los empleados solicitantes en una cuadrícula de dos columnas con scroll interno inteligente.
- **Tarjetas de Empleados Ultra-Compactas:** Las tarjetas de la vista de usuarios han pasado de ser bloques verticales grandes a un diseño horizontal, rectangulares y de altura reducida, optimizando el espacio en pantalla.
- **Mejoras en el Dashboard:** La gráfica circular de estado del inventario se ha actualizado para englobar de forma más precisa los historiales de incidentes con estado `Roto - Baja`.

### Corregido
- Restaurada la funcionalidad y el botón de "Editar Empleado" que había quedado oculto tras la refactorización de las tarjetas.
- Solucionado error en tiempo de ejecución de componente no definido (`ImagePlus`) en la vista de inventario.
- Mitigado aviso de desajuste de hidratación (Hydration Mismatch) al inyectar el tema del sistema operativo.

## [4.0.0] - 2026-07-16

### Añadido
- **Lanzamiento Inicial de la v4.0:** Reesctritura completa del sistema ToolTracker original (antiguamente basado en Python/Tkinter o tecnologías anteriores) a un entorno web moderno.
- **Stack Tecnológico:** Migración a Next.js 14 App Router, React 18, y Tailwind CSS.
- **Base de Datos ORM:** Integración de Prisma ORM para interactuar con la base de datos SQLite preexistente.
- **Modo Oscuro:** Soporte nativo para alternar entre Modo Claro y Oscuro mediante `next-themes`.
- Componentes UI basados en la librería `shadcn/ui`.
