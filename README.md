<div align="center">
  <h1>🛠️ ToolTracker Pro</h1>
  <p><strong>El sistema definitivo de gestión de activos, inventario y logística para equipos de alto rendimiento.</strong></p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://www.sqlite.org/"><img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /></a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/Version-4.2.0-blue?style=flat-square" alt="Version" />
    <img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License" />
  </p>
</div>

<hr/>

## 🆕 Changelog v4.2.0

*   **✉️ Envío de Actas por Email:** Integración con tu configuración SMTP para enviar directamente desde la ficha del empleado el Acta de Entrega/Devolución generada en PDF.
*   **📄 Informes Económicos de Incidencias en PDF:** Nueva función dinámica en la pestaña de Incidencias. Genera informes PDF filtrados al vuelo con el coste total sumado de las herramientas rotas o robadas.
*   **✨ Interfaz Modernizada y Toasts:** Sustitución global de alertas del navegador por notificaciones flotantes integradas (`sonner`). Ampliación de ventanas modales y rediseño en los botones de "Generar Acta" para acomodar el envío directo por email.
*   **🛠️ Corrección de Errores:** Limpieza profunda de herramientas duplicadas en base de datos (por IDs temporales). Solución al conflicto de bordes en los nuevos botones y solución a problemas de hidratación de Next.js al cargar las vistas.

## 🌟 Visión General

**ToolTracker Pro** revoluciona la forma en que los equipos técnicos gestionan su equipamiento de trabajo. Desarrollado nativamente para la web utilizando el último stack tecnológico, ofrece una experiencia de usuario (UX) premium inigualable, un rendimiento ultrarrápido sin recargas de página y un diseño impecable con soporte nativo para modo oscuro.

Se acabaron las hojas de cálculo perdidas y el caos en el almacén. Controla todo tu ecosistema en un solo lugar con métricas financieras y operativas en tiempo real.

## ✨ Características Destacadas

*   **📊 Dashboard Inteligente:** Panel de control en tiempo real con métricas operativas (herramientas en uso, incidentes) y financieras (valor del inventario, coste de averías).
*   **📦 Catálogo Visual:** Gestión de inventario con miniaturas, control de stock mínimo, estado en tiempo real (Disponible, Averiada, Prestada) y categorías personalizadas.
*   **🤝 Flujo de Préstamos Intuitivo:** Asignación y devolución de material en 2 clics. Mantén un historial inmutable de quién tuvo qué y cuándo.
*   **📬 Buzón de Solicitudes:** Los operarios pueden realizar peticiones que los responsables pueden aprobar y transformar en préstamos al instante.
*   **🚚 Gestión de Flota:** Control absoluto sobre los vehículos de la empresa, a quién están asignados y su disponibilidad.
*   **⚠️ Tracking de Averías e Incidentes:** Reporte detallado de roturas o pérdidas, con cálculo de costes asociados para toma de decisiones.
*   **🌙 Dark Mode & UX Premium:** Paletas de colores dinámicas, fondos *glassmorphism* animados y una interfaz diseñada para no cansar la vista durante largas jornadas.
*   **💾 Integración Nativa con Windows:** Importación y exportación de backups abriendo directamente el explorador de archivos nativo de tu sistema.

## 🚀 Tecnologías Utilizadas

El sistema ha sido reescrito desde cero abandonando arquitecturas antiguas (Python/Tkinter) para abrazar el desarrollo web moderno:

*   **Core:** Next.js 14 (App Router) + React 18.
*   **Estilos:** Tailwind CSS v4 con variables OKLCH para colores vibrantes y transiciones fluidas.
*   **Componentes:** Shadcn/UI y Lucide Icons para una estética pulida.
*   **Datos:** Prisma ORM interactuando directamente con SQLite local (`dev.db`), garantizando 0 latencia y portabilidad extrema.

## 🛠️ Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/urtziDV/TeamPlanner-Pro.git
cd TeamPlanner-Pro
```

### 2. Instalar dependencias
Asegúrate de tener Node.js instalado (v18 o superior).
```bash
npm install
```

### 3. Sincronizar la Base de Datos
El sistema utiliza SQLite para facilitar su despliegue sin dependencias externas complejas (sin necesidad de Docker o servidores SQL).
```bash
npx prisma generate
npx prisma db push
```

### 4. Arrancar el motor
```bash
npm run dev
```
🎉 ¡Listo! La aplicación estará disponible instantáneamente en `http://localhost:3000`.

## 📂 Estructura del Código

```text
📦 src/
 ┣ 📂 app/             # Rutas, páginas y Server Actions (Next.js App Router)
 ┃ ┣ 📂 inventory/     # Pantallas de Catálogo de Herramientas
 ┃ ┣ 📂 loans/         # Gestión de Préstamos
 ┃ ┣ 📂 requests/      # Buzón de Peticiones
 ┃ ┣ 📂 settings/      # Panel de Configuración y Backups
 ┃ ┗ 📜 globals.css    # Paleta de colores globales y themes
 ┣ 📂 components/      # Componentes UI reutilizables (Shadcn)
 ┗ 📂 lib/             # Cliente Prisma y utilidades genéricas
📦 prisma/
 ┣ 📜 schema.prisma    # Definición de tablas y relaciones
 ┗ 📜 dev.db           # Base de datos SQLite (¡No borrar!)
```

## 🤝 Soporte y Contribución

Este sistema es de uso interno exclusivo. Todas las arquitecturas, features y flujos han sido diseñados específicamente para optimizar la logística y el seguimiento del equipamiento.

---
<div align="center">
  <i>Desarrollado con ❤️ para llevar la eficiencia del equipo al siguiente nivel.</i>
</div>
