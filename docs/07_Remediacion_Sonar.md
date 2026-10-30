# Remediación del análisis inicial de SonarQube

Fecha: 30 de octubre de 2026. Base: `b784793a824c2b4a34b1eb95433e03375b30196e`, rama DEV. Correcciones preparadas con asistencia de OpenAI Codex.

## Evidencia inicial

Los archivos originales exportados por el estudiante se conservan, normalizados a UTF-8, en `qa/sonar/2026-10-30-inicial/`. Hay 11 hallazgos abiertos: uno Critical y diez Major. Las métricas tradicionales indican 3 bugs, 8 code smells, 0 vulnerabilidades, 0 % duplicación y 100 % cobertura sobre los archivos incluidos en la medición. El tablero MQR presenta 4 hallazgos de fiabilidad y 7 de mantenibilidad; son clasificaciones diferentes del mismo análisis.

El estado inicial del Quality Gate es `OK`, pero la respuesta exportada contiene `conditions: []`. Este resultado inicial no demuestra ausencia de hallazgos Critical ni sustituye la verificación de condiciones del gate para la integración continua.

## Cambios propuestos

| Regla | Cantidad | Corrección |
| --- | ---: | --- |
| javascript:S8786 | 1 | Sustituir la expresión regular de correo con retroceso por comprobaciones de posición, longitud y espacios. Agregar 20 casos de regresión. |
| javascript:S3776 | 1 Critical | Extraer la pantalla de acceso y el encabezado del espacio de trabajo de App para reducir su complejidad. |
| javascript:S9011 | 3 | Declarar explícitamente los botones de envío; declarar también los botones de acción. |
| javascript:S3358 | 3 | Eliminar ternarios anidados en el texto de envío y los títulos de navegación. |
| javascript:S6819 | 2 | Utilizar output para los mensajes de estado y mantener su presentación como bloque. |
| css:S4666 | 1 | Unificar las declaraciones de workspace en la misma media query. |

## Validación local de las correcciones

Ejecutada en el entorno de trabajo del asistente, sobre archivos modificados todavía sin commit. No representa una ejecución en GitHub Actions ni en Render.

- Build backend y frontend: aprobado.
- Pruebas unitarias: 110/110 (85 backend y 25 frontend).
- Cobertura: 100 % de líneas, sentencias, ramas y funciones en domain.js, security.js, api.js y rules.js. No es cobertura de toda la aplicación; las exclusiones existentes no cambiaron.
- Comparación de módulos críticos domain.js y rules.js: 0 % de base a 100 %, incremento de 100 puntos porcentuales.
- Newman: 24 solicitudes y 85 aserciones, sin fallos.
- Casos funcionales por HTTP: 60/60.
- Navegador Chromium: acceso, catálogo, solicitud, aprobación, auditoría y vista móvil aprobados; sin errores de JavaScript ni desbordamiento horizontal a 390 px.

## Pendiente de confirmación

Ejecutar nuevamente SonarScanner en el equipo del estudiante y exportar `final`. No se declara ningún hallazgo como cerrado hasta verificar el nuevo análisis. Conservar la evidencia inicial. Revisar las condiciones efectivas del Quality Gate, los permisos y secretos del pipeline y las vulnerabilidades de dependencias por separado.

```powershell
npm.cmd run build
npm.cmd run test:coverage
node scripts/check-coverage.mjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\sonar.ps1 -ProjectKey reservalab-dev
# Solo después de confirmar que SonarQube procesó el nuevo análisis:
node scripts/sonar-evidence.mjs final
```

SONAR_TOKEN debe existir en la sesión y nunca debe guardarse en Git. Para la comparación final, adjuntar también los hallazgos abiertos del nuevo análisis o una captura de su tablero.
