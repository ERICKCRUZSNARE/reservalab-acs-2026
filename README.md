# ReservaLab - Aseguramiento de la Calidad de Software 2026

**ERICK ESTUARDO CRUZ ROMERO · 0900-19-1362**

Aplicación académica de reserva y préstamo de equipos. React/Vite en `frontend`; Node/Express en `backend`. Persistencia PostgreSQL en cloud y PGlite en el disco local. Código original propuesto bajo MIT, generado con asistencia de ChatGPT/Codex, declarada en `docs/ANEXO_IA.md`.

## Estado verificable

- Aplicación compilada; flujo principal probado en Chromium, escritorio y móvil.
- 90 pruebas unitarias aprobadas, 65 backend / 25 frontend; al menos tres dobles de repositorio.
- Cobertura de líneas: 100% **en los cuatro archivos incluidos en el reporte**. No es cobertura global del producto. El incremento contra línea base de `domain.js` y `rules.js` es de 100 puntos porcentuales.
- 60 casos funcionales HTTP ejecutados: inicial 57/60; después de corregir tres defectos, 60/60.
- 24 solicitudes Postman/Newman; 85 aserciones aprobadas.
- 65 casos diseñados en total: los 60 funcionales y cinco verificaciones no funcionales. Carga cloud y despliegue público siguen pendientes.
- 10 fichas de hallazgos: 3 defectos funcionales y 7 hallazgos SCA de dependencias de desarrollo. Los hallazgos SCA **no se presentan como diez fallos funcionales ni como resultados de SonarQube**. Confirmar si el catedrático admite su cómputo en E5; de lo contrario faltan siete defectos funcionales reales.
- No están realizados: registro en el curso, publicación en GitHub/cloud, carga en TestLink, análisis en el SonarQube de Erick, tres revisiones de PR por otro integrante, carga cloud, videos ni reflexiones personales.

## Empezar en Windows

Instalar Node.js 24 LTS. Extraer el proyecto, abrir PowerShell en esta carpeta y ejecutar:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
npm run dev
```

Abrir http://localhost:5173. Backend: http://localhost:3001/api/health. Mantener la consola abierta. `INICIAR.cmd` permite iniciar nuevamente después de la instalación. `npm run build` crea el frontend de producción y revisa la sintaxis del backend; JavaScript no requiere transpilación en el backend.

Cuentas de demostración (solo datos ficticios, cambiar claves al desplegar):

| Rol | Correo | Contraseña local |
|---|---|---|
| Administrador | admin@reservalab.test | AdminDemo2026! |
| Estudiante | alumno@reservalab.test | AlumnoDemo2026! |
| Otro estudiante | otro@reservalab.test | AlumnoDemo2026! |

También se pueden registrar estudiantes. Las sesiones duran ocho horas en el servidor; el token se conserva en memoria del navegador, por lo que recargar requiere iniciar sesión de nuevo. Las reservas permanecen en la base de datos.

## Comandos de verificación

```powershell
npm ci
npm run build
npm run test:coverage
node scripts/check-coverage.mjs
npm run test:api
npm run test:functional
node scripts/persistence.mjs
```

Los tests HTTP crean una base en memoria y un servidor efímero. No alteran la base usada por `npm run dev`. Consultar `qa/evidencias/` y `coverage/index.html`. `npm audit --omit=dev` reportó cero vulnerabilidades conocidas; el informe completo conserva hallazgos del ejecutor Newman. No confundir ese escaneo SCA con análisis estático Sonar.

## Reproducir un caso que falla, sin volver a introducir errores

El ZIP no incluye una carpeta .git. Para recuperar el historial primero ejecuta:

```powershell
git clone ReservaLab_historial.bundle ../ReservaLab-con-historial
cd ../ReservaLab-con-historial
```

Luego:

```powershell
git worktree add ../ReservaLab-base baseline-v0
New-Item -ItemType Directory -Force ../ReservaLab-base/scripts
Copy-Item scripts/functional.mjs ../ReservaLab-base/scripts/functional.mjs -Force
```

En esa carpeta: `npm ci` y `node scripts/functional.mjs --baseline`. La versión inicial reproduce CP-50, CP-51 y CP-59 fallidos. La versión actual los aprueba. No desplegar públicamente la versión inicial.

## SonarQube de tu computadora

Crear un proyecto `reservalab-dev` y un token de análisis. Definir `SONAR_TOKEN` en la sesión local sin guardarlo en archivos. Ejecutar `npm run test:coverage` y `./scripts/sonar.ps1`. El contenedor del scanner accede a tu Sonar mediante `host.docker.internal:9000`; tu navegador usa `localhost:9000`. El script espera el Quality Gate y devuelve error si falla. El servidor de Sonar debe estar encendido en Docker Desktop.

Exportación: `node scripts/sonar-evidence.mjs inicial` antes de remediar y `node scripts/sonar-evidence.mjs final` después. Si la primera medición se hace sobre esta versión ya corregida, declararlo; no inventar una medición retrospectiva de Sonar. Para analizar la versión inicial, usar un worktree separado y un proyecto Sonar identificado explícitamente.

## CI/CD y ramas

Workflow: `.github/workflows/quality.yml`. Requiere un runner GitHub Actions **autohospedado Windows x64** en tu computadora, con Node 24, Git y Docker Desktop. Un runner de GitHub en la nube no puede acceder al localhost de tu PC. Mantener el repositorio privado para no ejecutar contribuciones públicas no confiables en el equipo personal; dar acceso al catedrático.

Crear ambientes DEV, QA y PROD. En cada uno: secreto `SONAR_TOKEN`, secreto `RENDER_API_KEY`; variables `SONAR_PROJECT_KEY` (`reservalab-dev`, `reservalab-qa`, `reservalab-prod`), `RENDER_BACKEND_ID`, `RENDER_FRONTEND_ID`. Orden: build -> unitarias/cobertura -> Sonar+gate -> API -> regresión -> despliegue del SHA evaluado. PR no despliega. Configurar reglas de protección de QA y main para requerir `quality` y revisión externa. Trabajando solo, solicitar la adaptación de revisión de PR al catedrático; no fingir aprobaciones.

## Despliegue y persistencia cloud

`render.yaml` prepara frontend estático y API QA por separado. Configurar `VITE_API_URL` con la URL del backend y `APP_ORIGIN` con el origen exacto del frontend, sin barra final. Crear PostgreSQL persistente, por ejemplo en Neon, y suministrar `DATABASE_URL` con TLS. No usar el directorio PGlite en un servicio Render gratuito: su disco es efímero. Mantener bases separadas por ambiente y usar únicamente datos ficticios. La plantilla no crea los tres ambientes automáticamente.

Después del primer despliegue controlado, los siguientes los ejecuta el pipeline. El archivo de despliegue espera a que ambos servicios reporten `live`. El paquete no contiene URL pública inventada ni acredita cloud hasta que se ejecute realmente.

## Carga

Con k6 instalado y QA desplegado, definir `BASE_URL`, `EMAIL` y `PASSWORD` como variables de entorno. Ejecutar `k6 run qa/carga/reservalab.k6.js`. Mantiene 50 usuarios cinco minutos después de una rampa de un minuto. Guardar el resultado y contrastar p95 <2s y errores <1%. No sustituir este requisito con una medición local de Newman.

## TestLink

Importar `qa/TestLink_Casos.xml` en el proyecto ReservaLab. Crear un plan y dos builds (inicial y regresión), agregar los casos al plan y generar una clave API personal. `scripts/import-testlink.py` publica resultados reales existentes después de configurar las variables indicadas en el propio script. No se ha probado la conexión contra una instancia TestLink en esta sesión. También se permite registrar manualmente la ejecución y adjuntar la evidencia JSON/capturas. Importar casos no equivale a ejecutarlos.

## Entrega

Consultar los siete PDF de `docs/pdf/`, los anexos JSON/XML, las capturas y el bundle Git adjunto. Los documentos tienen estado de preparación; completar los componentes externos antes de entregar al curso. El video requiere rostro visible y demostración personal, sin leer guion. Las bitácoras se completan con la experiencia real de Erick.

## Publicar tu historial real

Después de conectar GitHub, crear un repositorio vacío y cambiar el remoto origin de la copia clonada a su URL real. Subir DEV, QA, main y los tags. No reescribir los commits de asistencia IA como si fueran trabajo manual. Configurar tu nombre y correo de Git para los cambios que tú realices. El bundle conserva únicamente trabajo ocurrido durante esta preparación; las ramas locales no demuestran promociones revisadas.
