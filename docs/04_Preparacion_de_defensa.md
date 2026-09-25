# Preparación de la defensa

Pauta de práctica, demostraciones y preguntas de comprensión.

Material para practicar. No leer como guion durante la grabación.

## 1. Reglas que debe cumplir cada video

• Máximo diez minutos y un único video por fase, publicado en YouTube público o no listado.

• Iniciar con nombre completo y carné. Mantener cámara encendida y rostro visible durante todo el segmento.

• Demostrar en pantalla el componente, no mostrar únicamente capturas.

• Al ser un solo integrante, preparar una toma continua que cubra los tres roles; confirmar con el catedrático la adaptación del equipo individual.

• No leer un guion en cámara. Practicar para explicar con palabras propias.

• El enlace debe permanecer accesible hasta publicación de notas. No usar modo privado.

## 2. Fase 1 · Pauta de nueve minutos

| Tiempo | Demostración | Qué debes explicar |
|---|---|---|
| 0:00-0:40 | Identificación y producto | Nombre, carné, origen con IA y problema que resuelve. |
| 0:40-2:00 | Aplicación desplegada | Login, catálogo y reserva; mostrar la URL pública real. |
| 2:00-3:10 | Requisitos y arquitectura | Cliente/servidor separados; regla 1-8 horas; actores y base. |
| 3:10-5:50 | Tres casos en vivo | CP-20 aprobado; CP-19 aprobado por rechazar 59 min; CP-51 fallido en baseline-v0 y corregido en versión actual. |
| 5:50-7:10 | Herramienta profesional | Plan, ejecución, matriz y defecto con evidencia real. |
| 7:10-8:20 | Métricas y limitaciones | 57/60 inicial; 60/60 después; no confundir SCA con funcionales. |
| 8:20-9:10 | Aprendizaje y cierre | Aporte personal verificable y enlace/evidencia. |

La corrida completa ejecuta rápidamente los casos y permite mostrar CP-51 con resultado Fallido en la versión inicial. Para una demostración HTTP directa, crear dos reservas contiguas y, en la versión inicial, mantener la primera sin devolver al entregar la segunda. El reloj controlado del script evita esperar una hora. Aclarar que ese reloj se usa solo en el arnés de pruebas.

### 3. Reproducir el fallo conservado

Si extrajiste el ZIP sin carpeta .git, primero restaura el historial: git clone ReservaLab_historial.bundle ../ReservaLab-con-historial. Entra a esa carpeta y ejecuta los siguientes comandos. No son revisiones de PR, sino historial local real.

```
git worktree add ../ReservaLab-base baseline-v0
New-Item -ItemType Directory -Force ../ReservaLab-base/scripts
Copy-Item scripts/functional.mjs ../ReservaLab-base/scripts/functional.mjs -Force
cd ../ReservaLab-base
npm ci
node scripts/functional.mjs --baseline
```

La aplicación actual contiene la solución; no eliminar validaciones para simular una falla nueva. Sobre la línea base, CP-50, CP-51 y CP-59 fallan por discrepancias reales ya documentadas. Verificar previamente la reproducción y mostrar la salida original, no un archivo editado.

## 4. Fase 2 · Pauta de nueve minutos

| Tiempo | Demostración | Qué debes explicar |
|---|---|---|
| 0:00-0:40 | Identificación | Nombre, carné y titularidad de los tres roles. |
| 0:40-1:40 | Ramas y PR | Promoción DEV->QA->main y revisión externa real/adaptación autorizada. |
| 1:40-3:00 | Unitarias y cobertura | Unidad aislada, mocks y alcance del 100%; comparación con base. |
| 3:00-4:10 | API | Flujo de 24 solicitudes; aserciones de esquema/contenido. |
| 4:10-6:20 | Pipeline completo | Iniciar una ejecución en vivo y mostrar sus etapas y resultado; mantener toma continua. |
| 6:20-7:40 | Sonar | Estado inicial/final, Blocker/Critical y gate real. |
| 7:40-8:50 | Carga | Perfil 50 VU/5 min, promedio/p95/throughput/error y contraste RNF. |
| 8:50-9:30 | Reflexión | Límites del entorno y mejoras verificables. |

El tiempo real del pipeline debe ensayarse antes. Si tarda más que el espacio disponible, consultar al catedrático cómo demostrarlo dentro del límite sin editar la toma interna ni fingir una ejecución. No sustituir una ejecución exigida en vivo por una captura o video pregrabado sin autorización.

## 5. Preguntas para practicar

### ¿Por qué no basta un CRUD?

Porque se evalúan reglas entre entidades, decisiones de disponibilidad, permisos, cupos, concurrencia y transiciones.

### ¿Una respuesta 409 significa prueba fallida?

No. Si el caso esperaba rechazar un conflicto con 409, la prueba pasa. Falla cuando obtenido difiere de esperado.

### ¿Qué diferencia hay entre unitarias y API?

La unitaria aísla una función con framework/dobles; la API envía solicitudes HTTP y valida contrato/flujo entre componentes.

### ¿Qué demuestra 100% de cobertura?

Que las líneas del alcance declarado se ejecutaron; no asegura ausencia de defectos ni cobertura global de la aplicación.

### ¿Por qué se volvió a consultar disponibilidad al aprobar?

Porque entre solicitud y aprobación otra reserva puede ocupar el horario. La comprobación debe ser transaccional.

### ¿Qué causó DEF-02?

Se verificaba la ventana temporal pero no la devolución física del préstamo previo. Se agregó bloqueo del equipo y consulta de préstamo abierto.

### ¿Por qué PostgreSQL externo en cloud?

La persistencia no debe depender del disco efímero de un servicio gratuito. La base mantiene los registros entre reinicios.

### ¿Qué hace el Quality Gate?

Evalúa condiciones de calidad y bloquea el paso posterior si falla; no corrige el código por sí mismo.

### ¿Qué son promedio, p95 y throughput?

Promedio resume latencias; p95 deja el 95% de solicitudes por debajo del valor; throughput mide solicitudes por segundo.

### ¿Qué parte hiciste tú y qué hizo la IA?

Describir con honestidad la generación asistida y las tareas que realmente ejecutaste, revisaste y comprendiste; mostrar tus commits reales.

### 6. Lista antes de grabar

• Probar micrófono, cámara, texto legible y conexión.

• Cerrar vistas de contraseñas/tokens y utilizar datos demo.

• Verificar enlaces en sesión independiente.

• Ensayar una toma completa menor de diez minutos.

• Tener abiertas las herramientas que demostrarás; no leer este documento en cámara.

• Después de subir a YouTube, revisar audio, imagen, duración y acceso no listado/público.
