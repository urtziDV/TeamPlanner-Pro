# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [4.2.0] - 2026-07-22

### Añadido
- **Envío de Actas por Email:** Integración con servidor SMTP para enviar Actas de Entrega/Devolución generadas en PDF directamente al correo del empleado.
- **Informes Económicos de Incidencias en PDF:** Nueva funcionalidad para generar y exportar reportes filtrados con el coste total acumulado de herramientas robadas, rotas o perdidas.
- **Tour Guiado de Bienvenida:** Incorporación de un tour guiado interactivo (`react-joyride`) para ayudar a los usuarios nuevos a entender los diferentes módulos del sistema (Inventario, Préstamos, Flota, etc.).
- **Avisos Preventivos de Conversión Genérica:** Añadido un cuadro de diálogo de advertencia al intentar marcar una herramienta como Genérica si ya tiene Números de Serie registrados, ofreciendo la opción de purgar la lista para garantizar el funcionamiento correcto.

### Cambiado
- **Modernización de Alertas (Toasts):** Reemplazadas todas las alertas nativas bloqueantes (`window.alert`) por un elegante sistema de notificaciones no intrusivas usando la librería `sonner`.
- **Ampliación de Interfaz de Inventario:** El modal para añadir y editar herramientas ahora usa un tamaño máximo superior (`sm:max-w-4xl`), mostrando dos columnas y aprovechando mucho mejor el espacio en resoluciones altas.
- **Botones Estilizados en Inventario:** Rediseñados los botones de Atributos Especiales ("Es Básica", "Es Genérica", "Apto Proyecto") en la pestaña de Edición, adoptando un diseño más limpio y sutil para evitar distracciones, y equipados con 'tooltips' de ayuda contextual.
- **Selector Inteligente de Números de Serie:** El modal de asignación ahora desglosa el bloque monolítico de Números de Serie en una lista vertical limpia con botones independientes, ocultando en tiempo real las unidades que ya han sido prestadas a otros empleados. Se ha simplificado el texto del botón a "Asignar" para mayor limpieza visual.
- **Indicador Visual de Stock:** Añadido un badge dinámico que muestra la cantidad de Números de Serie registrados actualmente en la edición de inventario, para no tener que contarlos a mano.
- **Botones Divididos (Split Buttons):** Los botones de Generar Actas en la ficha de usuario han sido remodelados en botones combinados con accesos directos al nuevo envío por email.

### Corregido
- **Bloqueo Fantasma de Herramientas Genéricas:** Solucionado un error crítico donde asignar una sola unidad de una herramienta genérica/básica con múltiples unidades en stock bloqueaba el resto del lote para otros empleados. El motor de préstamos (manual y de Kits) ahora evalúa matemáticamente el stock remanente en lugar de basarse en la etiqueta estática de estado de la base de datos.
- **Limpieza Automática de IDs de Empleados:** Desarrollado y ejecutado un script de limpieza para purgar duplicados temporales y dejar solo las asignaciones validadas por Números de Serie reales en el historial.
- **Solución de Hidratación en Formularios:** Refactorizada la estructura del DOM en los modales de DialogTrigger para evitar un fallo de Next.js de `<button>` anidados.
- **Ceguera de Préstamos Legacy (v3.x):** Corregido un fallo crítico en el filtro de asignaciones donde los préstamos importados de versiones antiguas eran invisibles para el motor moderno debido a la ausencia de `Herramienta_ID`. 
- **Migración y Saneamiento Masivo de Stock:** Desarrollado y ejecutado un script para cruzar un CSV histórico con la base de datos, inyectando de forma permanente el texto real del Número de Serie en 50 asignaciones "ciegas" antiguas. Esto restaura al 100% la precisión del filtro de inventario libre.
- **Compatibilidad SMTP con Modelo Prisma:** Corregida la referencia incorrecta `prisma.configuracion` (modelo inexistente) por el modelo real `prisma.config` con sus campos actuales (`key`/`value`), desbloqueando la compilación de producción.
- **Migración de Tour Guiado a react-joyride v3:** Actualizada la integración del tour de bienvenida para adaptarse a los cambios de API que rompían la compilación: `callback` → `onEvent`, props directas (`showProgress`, `hideCloseButton`, etc.) → `options={}`, y corrección de los tipos exportados (`EventData`, `Controls`).

## [4.1.0] - 2026-07-21

### Añadido
- **Mantenimiento Predictivo:** Se ha añadido la capacidad de registrar frecuencias y fechas de última calibración/mantenimiento en las herramientas, incluyendo una alerta visual al intentar asignar herramientas caducadas.
- **Descripción Obligatoria en Vehículos:** El registro de asignaciones de flota ahora requiere justificar obligatoriamente el uso o destino.
- **Métricas ROI Precisas:** El panel analítico ahora contabiliza averías (con coste de reparación €0 derivado al valor original) y robos de manera estricta para la gráfica de mayores pérdidas.
- **Tooltips Premium Globales:** Añadidos cuadros de información (tooltips) descriptivos con estilo oscuro e interactivo a todos los botones de iconos en toda la aplicación, mejorando sustancialmente la intuición y curva de aprendizaje.

### Cambiado
- **Selectores en Incidentes:** El formulario de registro de incidentes se ha rediseñado para usar menús desplegables (selects) dinámicos en lugar de texto libre para seleccionar Empleados y Herramientas (abarcando todo el inventario, por si se reportan roturas a posteriori).
- **Lectura Mejorada en Modo Oscuro:** Modificado el color de texto del título en el generador de QRs para forzar su legibilidad cuando se previsualiza la pegatina en Modo Oscuro.

### Corregido
- **Filtro de Estado en Inventario:** Arreglada la lógica del filtro "Prestada" y "Pérdida/Averiada". Ahora sí detectan correctamente unidades asignadas o perdidas procedentes de herramientas genéricas sin obligar a cambiar el estado global de toda la herramienta.
- **Etiquetas de Unidades Desglosadas:** Las tarjetas del inventario ya no aplican un estado único falso, sino que desglosan claramente cuántas unidades están "Disponibles", "Averiadas" o son "Pérdida" mediante un sistema de etiquetas (badges).
- **Generación Multi-QR:** Corregido el separador en la lectura de números de serie múltiples. Ahora es capaz de procesar listas separadas por saltos de línea y espacios (no solo por comas), generando los códigos de pegatina individualizados correctamente para cada unidad.

## [4.0.3] - 2026-07-21

### Añadido
- **Calendario Infinito y Fines de Semana:** El calendario de vehículos ahora cuenta con botones para navegar indefinidamente por las semanas, agrupa los días bajo una cabecera de "Semana y Año", y resalta visualmente los fines de semana.
- **Reservas Futuras en Vehículos:** Ahora es posible hacer una reserva a futuro para un vehículo que está actualmente en uso por otro empleado, permitiendo la convivencia de ambas acciones.
- **Historial Editable:** Se han añadido controles en la pestaña Historial de Vehículos para poder editar o eliminar directamente las asignaciones/reservas registradas.
- **Fecha de Inicio en Préstamos:** Añadido un campo específico de "Fecha Inicio" al crear un préstamo de herramienta, permitiendo asignar fechas retroactivas o a futuro.

### Cambiado
- **Separación Vehículos / Ubicaciones:** Las "Ubicaciones" se han trasladado a la sección de Categorías para dejar la página de Vehículos dedicada 100% a la gestión de la flota móvil.
- **Desplegable de Asignación de Herramientas:** Optimizado para no mostrar cada número de serie individualmente, sino la herramienta genérica si tiene unidades disponibles.
- **Pegatinas QR Mejoradas:** Ampliada la ventana modal de generación de QR. Se ha eliminado el ID interno de la pegatina física y ahora el texto largo hace saltos de línea en vez de cortarse con puntos suspensivos.

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
