
  # Casa Musical SPA 2.0

  Aplicación interna para gestión de **alumnos, profesores, finanzas, inventario y documentos** de Casa Musical.

  ## 1) Cómo ejecutar en tu computador

  1. Instala dependencias:
     - `npm install`
  2. Inicia la app en modo desarrollo:
     - `npm run dev`
  3. Abre en el navegador la URL que entrega Vite (normalmente `http://localhost:5173`).

  ## 2) Cómo generar versión lista para publicar

  1. Construye la app:
     - `npm run build`
  2. Se crea la carpeta `dist/` con archivos estáticos listos para subir.

  ## 3) Respaldo y restauración de datos (importante)

  La app guarda datos en el navegador (localStorage).  
  Para mover datos entre computadores:

  1. En la barra superior, presiona **Respaldo** (descarga `.json`).
  2. En el otro computador, abre la app y presiona **Restaurar**.
  3. Selecciona el archivo `.json` descargado.

  Con esto Carolina puede partir con la misma información que tú ya cargaste.

  ## 4) Formas de compartir la app con Carolina

  ### Opción A: Compartir por internet (recomendada)

  Publica `dist/` en una plataforma estática:
  - Netlify
  - Vercel
  - GitHub Pages

  Resultado: Carolina abre un link y usa la app sin instalar nada.

  ### Opción B: Ejecutarla local en el computador de Carolina

  1. Le compartes el proyecto (zip o repo).
  2. Ella ejecuta:
     - `npm install`
     - `npm run dev`
  3. Abre `http://localhost:5173`.

  ### Opción C: Entregar solo datos de trabajo

  Si ya tiene la app corriendo, tú le envías solo el respaldo `.json` para restaurar.

  ## 5) Checklist simple de pruebas

  1. Crear un alumno con apoderado, instrumento y aporte.
  2. Registrar una clase con fecha manual y descripción.
  3. Generar voucher del apoderado y validar detalle financiero.
  4. Exportar respaldo.
  5. Borrar un dato de prueba y restaurar respaldo para confirmar recuperación.
  