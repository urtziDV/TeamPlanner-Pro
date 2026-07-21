# Instrucciones de Compilación (ToolTracker Pro)

Esta guía explica cómo generar el instalador de ToolTracker Pro (`.exe`) desde el código fuente, utilizando **Electron Builder** y **Next.js (Standalone mode)**.

## Requisitos Previos
1. **Node.js** (versión 18 o superior).
2. Entorno Windows (para generar el archivo `.exe` con NSIS).
3. **¡IMPORTANTE!** Asegúrate de que **NO hay ningún servidor de desarrollo corriendo** (`npm run dev`) y de que la aplicación ToolTracker Pro está completamente cerrada. Si hay instancias corriendo, la base de datos o las carpetas de salida estarán bloqueadas por Windows, y el script de compilación fallará (Error `EPERM`).

## Preparar el Icono (solo si cambia el logo)

Si se modifica `logo.png`, es necesario regenerar el archivo `logo.ico` con todos los tamaños de Windows embebidos para que el icono del instalador y de la ventana se vean correctamente:

```bash
node fix_logo.js      # Recorta transparencia y redimensiona a 512x512
node generate_ico.js  # Genera logo.ico con capas de 16, 32, 48, 64, 128 y 256 px
```

> **Nota:** `logo.ico` debe existir en la raíz del proyecto **antes** de compilar. Está incluido en el repositorio, así que este paso solo es necesario si cambias el logo.

## Compilando el Ejecutable

1. Abre una terminal en el directorio raíz del proyecto (`ToolTracker-Pro`).
2. Instala las dependencias (si no lo has hecho ya):
   ```bash
   npm install
   ```
3. Ejecuta el script de empaquetado:
   ```bash
   npm run dist
   ```

## ¿Qué hace el script `npm run dist`?
El proceso está automatizado para superar las limitaciones de tamaño y de resolución de módulos de Next.js + Prisma dentro de Electron. Todo está orquestado por `build-scripts/build.js`:

1. **Limpieza:** Elimina las carpetas `dist` y `next-standalone` anteriores.
2. **Next.js Build:** Lanza la compilación de Next.js con `output: 'standalone'`, generando una versión optimizada del servidor en `.next/standalone`.
3. **Mover Archivos:** Mueve ese servidor optimizado a la carpeta `next-standalone`.
4. **Copiar Estáticos:** Inyecta las carpetas `public` y `.next/static` dentro del standalone.
5. **Fix Turbopack:** Copia binarios internos del runtime que Next.js no exporta por defecto.
6. **Copiar Prisma:** Transfiere el motor de Prisma (`prisma`, `.prisma`, `@prisma`) al directorio standalone.
7. **Empaquetado con Electron Builder:** Ejecuta `electron-builder --win`.
   - El directorio `electron/` (con `main.js` y `logo.ico`) se empaqueta en el ASAR.
   - La carpeta `next-standalone/` completa (con `server.js`, `.next/`, etc.) se copia como `extraResources` directamente al disco físico en `resources/next-standalone/`, **fuera del ASAR**. Esto es imprescindible porque `spawn()` necesita un archivo ejecutable físico en disco para arrancar el servidor.
8. **Inyección de `node_modules` (`afterPack.js`):** El gancho `afterPack.js` inyecta los `node_modules` del standalone en la carpeta `win-unpacked` saltándose la poda restrictiva de `electron-builder`.

## Arquitectura en Producción

```
AppData/Local/Programs/tooltracker-web/
├── ToolTracker Pro.exe        ← Binario de Electron
└── resources/
    ├── app.asar               ← Código Electron (main.js, logo.ico, etc.)
    └── next-standalone/       ← Servidor Next.js (FÍSICO, fuera del asar)
        ├── server.js          ← Punto de entrada del servidor
        ├── .next/             ← Bundle compilado de Next.js
        └── node_modules/      ← Dependencias (Prisma, etc.)
```

El `main.js` de Electron lanza `server.js` con `process.resourcesPath` como base de la ruta, esperando a que responda en `http://localhost:3000` antes de cargar la ventana.

## Resultado Final
Tras finalizar el proceso (puede tardar un par de minutos), estos archivos estarán disponibles en la carpeta `dist/`:

| Archivo | Descripción |
|---|---|
| `ToolTracker Pro Setup 4.x.x.exe` | Instalador NSIS para Windows |
| `latest.yml` | Metadatos de versión para auto-actualizaciones |
| `ToolTracker Pro Setup 4.x.x.exe.blockmap` | Mapa de bloques para actualizaciones delta |

## Publicar un Release en GitHub
Para que las actualizaciones automáticas funcionen, al publicar una nueva versión en GitHub Releases debes adjuntar **los tres archivos** listados arriba.
