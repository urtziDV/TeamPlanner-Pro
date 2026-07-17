# Instrucciones de Compilación (ToolTracker Pro)

Esta guía explica cómo generar el instalador de ToolTracker Pro (`.exe`) desde el código fuente, utilizando **Electron Builder** y **Next.js (Standalone mode)**.

## Requisitos Previos
1. **Node.js** (versión 18 o superior).
2. Entorno Windows (para generar el archivo `.exe` con NSIS).
3. **¡IMPORTANTE!** Asegúrate de que **NO hay ningún servidor de desarrollo corriendo** (`npm run dev`) y de que la aplicación ToolTracker Pro está completamente cerrada. Si hay instancias corriendo, la base de datos o las carpetas de salida estarán bloqueadas por Windows, y el script de compilación fallará (Error `EPERM`).

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

1. **Limpieza:** Elimina las carpetas `dist` y `next-standalone` anteriores para evitar el temido "bucle infinito" de compilación que rompe el proceso.
2. **Next.js Build:** Lanza la compilación de Next.js. Gracias a que en `next.config.ts` se indica `output: 'standalone'`, esto generará una versión altamente optimizada del servidor web en `.next/standalone`.
3. **Mover Archivos:** Mueve ese servidor optimizado a la carpeta `next-standalone`.
4. **Copiar Estáticos:** Inyecta las carpetas `public` y `.next/static` dentro del standalone, ya que el modo standalone no las incluye por defecto.
5. **Fix Turbopack:** Copia ciertos binarios internos del runtime que Next.js olvida exportar.
6. **Copiar Prisma:** Transfiere el motor de base de datos de Prisma y sus tipados (`node_modules/prisma`, `.prisma`, `@prisma`) al directorio standalone para que la aplicación pueda hacer queries a la DB cuando esté empaquetada.
7. **Empaquetado ASAR:** Ejecuta `electron-builder`. Este paso ignora las dependencias masivas del `package.json` porque todas se movieron inteligentemente a `devDependencies`, manteniendo el peso a raya (~130 MB).
8. **Inyección de `node_modules` (`afterPack.js`):** Justo antes de empaquetar el NSIS, el gancho `afterPack.js` inyecta toda nuestra estructura `next-standalone` dentro del directorio `win-unpacked` saltándose la poda restrictiva de `electron-builder`.

## Resultado Final
Tras finalizar el proceso (puede tardar un par de minutos), el instalador `.exe` estará disponible en la carpeta:
`dist/ToolTracker Pro Setup x.x.x.exe`
