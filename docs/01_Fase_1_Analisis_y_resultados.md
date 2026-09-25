# Fase 1 · Análisis y resultados

E1-E8: producto, requerimientos, arquitectura, pruebas y estado real de ejecución.

Documento técnico - ejecución local verificada

## 1. Registro propuesto de la aplicación

| Campo | Información |
|---|---|
| Nombre | ReservaLab |
| Origen | Aplicación generada con IA bajo especificación del estudiante; no se evalúa su construcción. |
| Responsable | ERICK ESTUARDO CRUZ ROMERO, 0900-19-1362 |
| Roles | Analista de Pruebas, Ingeniero de Automatización e Ingeniero de Plataforma/DevOps, asumidos por Erick. |
| Tecnologías | React + Vite; Node.js 24 + Express; PGlite local / PostgreSQL cloud. |
| Licencia | MIT para código original; licencias de dependencias conservadas. |
| Repositorio y URL | Pendientes de publicación; no existe registro previo en el curso. |
| Línea base | Tag baseline-v0, sin pruebas automatizadas de origen; instrumentación sin tests: 0% en domain.js y rules.js. |
| Estado | Preparado para registrar, no registrado ni aprobado por el catedrático. |

## 2. E1 · Descripción y alcance

ReservaLab apoya al laboratorio que comparte equipos entre estudiantes. Sustituye una agenda informal por solicitudes con reglas de duración y disponibilidad, aprobación administrativa, entrega y devolución. El resultado esperado del negocio es evitar comprometer un mismo equipo en horarios incompatibles y conservar quién autorizó cada operación.

El estudiante consulta equipos, solicita horarios y cancela antes del inicio. El administrador agrega equipos, gestiona mantenimiento, aprueba/rechaza solicitudes y registra movimientos físicos. Ambos roles pueden consultar su información; solo el administrador ve todas las reservas y la auditoría.

Alcance: un laboratorio, equipos identificables individualmente, reservas de una sola unidad, tiempos registrados como milisegundos UTC y mostrados en la zona del dispositivo. No incluye cobros, correo, facturación, geolocalización ni integración con inventarios reales. Las solicitudes vencidas no expiran automáticamente: el administrador debe rechazarlas para liberar el cupo; esta limitación está declarada.

### 2.1 Reglas de negocio

| Regla | Definición |
|---|---|
| RB-01 | Sesión de ocho horas, rol verificado en servidor. |
| RB-02 | Inicio estrictamente futuro y hasta 30 días; intervalos de 1 a 8 horas; precisión de minutos. |
| RB-03 | Propósito de 10 a 300 caracteres después de quitar espacios externos. |
| RB-04 | Máximo tres reservas en REQUESTED, APPROVED o CHECKED_OUT por usuario. |
| RB-05 | Las solicitudes pueden competir; la aprobación vuelve a verificar disponibilidad bajo transacción. |
| RB-06 | [inicio,fin) permite reservas contiguas pero no solapadas. |
| RB-07 | Entrega desde inicio-15 min hasta antes del fin y sin préstamo anterior sin devolver. |
| RB-08 | Devolución única; retraso=max(0,ceil((devuelto-fin)/60 000)). |
| RB-09 | No pasar a mantenimiento o retirado un equipo con reservas aprobadas o préstamos activos. |

## 2.2 Casos de uso principales

### CU-01 · Registrar estudiante

| Elemento | Descripción |
|---|---|
| Actor | Visitante |
| Precondición | No tener cuenta con ese correo. |
| Flujo principal | Abrir Crear cuenta; completar nombre/correo/contraseña; enviar; el servidor valida y registra STUDENT; mostrar confirmación. |
| Flujo alterno | Correo duplicado: informar conflicto. Datos inválidos: indicar validación sin crear usuario. |
| Requerimientos | RF-01 |

### CU-02 · Iniciar y cerrar sesión

| Elemento | Descripción |
|---|---|
| Actor | Estudiante o administrador |
| Precondición | Cuenta existente. |
| Flujo principal | Ingresar credenciales; recibir sesión; acceder al catálogo; al terminar, cerrar sesión y revocar token. |
| Flujo alterno | Clave incorrecta: 401. Diez errores previos: 429. Sesión vencida: solicitar ingreso nuevamente. |
| Requerimientos | RF-02, RF-03 |

### CU-03 · Consultar equipos

| Elemento | Descripción |
|---|---|
| Actor | Usuario autenticado |
| Precondición | Sesión vigente. |
| Flujo principal | Abrir Equipos; revisar fichas; escribir nombre/código/categoría; ver coincidencias y estado. |
| Flujo alterno | Sin coincidencias: mostrar estado vacío. Error de conexión: mensaje y botón Actualizar. |
| Requerimientos | RF-04 |

### CU-04 · Crear y mantener equipo

| Elemento | Descripción |
|---|---|
| Actor | Administrador |
| Precondición | Código nuevo para alta; sin compromisos para mantenimiento/retiro. |
| Flujo principal | Agregar equipo; completar datos; guardar; ver nueva ficha; elegir estado y confirmar; guardar evento. |
| Flujo alterno | Código duplicado: 409. Estudiante: 403. Reserva aprobada o préstamo activo: impedir mantenimiento/retiro. |
| Requerimientos | RF-03, RF-05, RF-14 |

### CU-05 · Solicitar reserva

| Elemento | Descripción |
|---|---|
| Actor | Estudiante o administrador |
| Precondición | Equipo disponible y menos de tres reservas activas. |
| Flujo principal | Elegir equipo; indicar inicio, fin y propósito; validar límites; confirmar ausencia de conflicto; registrar REQUESTED e historial. |
| Flujo alterno | Duración/anticipación inválida: 422; cupo agotado o equipo no disponible: 409; equipo inexistente: 404. |
| Requerimientos | RF-06, RF-07, RF-09, RF-14 |

### CU-06 · Aprobar o rechazar solicitud

| Elemento | Descripción |
|---|---|
| Actor | Administrador |
| Precondición | Reserva REQUESTED. |
| Flujo principal | Abrir Reservas; revisar datos; aprobar: revalidar tiempo, equipo y solapamiento dentro de transacción; guardar APPROVED. Rechazar: guardar REJECTED. |
| Flujo alterno | Otro actor: 403; transición inválida o conflicto de agenda: 409; rechazo sigue permitido para solicitudes vencidas. |
| Requerimientos | RF-03, RF-08, RF-09, RF-14 |

### CU-07 · Cancelar reserva

| Elemento | Descripción |
|---|---|
| Actor | Propietario o administrador |
| Precondición | REQUESTED/APPROVED y antes de iniciar. |
| Flujo principal | Abrir reserva; pulsar Cancelar; confirmar; validar autorización y tiempo; cambiar a CANCELLED; liberar cupo/horario. |
| Flujo alterno | Otro estudiante: 403; ya inició o estado no cancelable: 409. |
| Requerimientos | RF-03, RF-10, RF-14 |

### CU-08 · Entregar equipo

| Elemento | Descripción |
|---|---|
| Actor | Administrador |
| Precondición | Reserva APPROVED; ventana de entrega válida; sin préstamo anterior abierto. |
| Flujo principal | Abrir reserva; verificar entrega física; pulsar Entregar; confirmar; bloquear equipo y consultar préstamos activos; cambiar a CHECKED_OUT. |
| Flujo alterno | Antes de ventana o después del fin: 409; equipo aún prestado: 409 OUTSTANDING_LOAN. |
| Requerimientos | RF-03, RF-11, RF-14 |

### CU-09 · Registrar devolución

| Elemento | Descripción |
|---|---|
| Actor | Administrador |
| Precondición | Reserva CHECKED_OUT. |
| Flujo principal | Recibir equipo; registrar devolución; guardar RETURNED y fecha; calcular máximo de cero y techo de (devolución-fin)/60 000; agregar historial. |
| Flujo alterno | Solicitud, reserva cancelada o devolución repetida: 409; actor sin permiso: 403. |
| Requerimientos | RF-03, RF-12, RF-14 |

### CU-10 · Consultar resumen e historial

| Elemento | Descripción |
|---|---|
| Actor | Usuario autenticado; historial solo ADMIN |
| Precondición | Sesión vigente y eventos opcionales. |
| Flujo principal | Revisar conteos del panel; administrador abre Actividad; consultar fecha, actor, acción y entidad de los últimos 100 eventos. |
| Flujo alterno | Sin datos: mostrar cero/lista vacía; estudiante no puede consultar auditoría. |
| Requerimientos | RF-13, RF-14 |

## 2.3 Requerimientos funcionales

### RF-01 · Registro de estudiantes

Crear cuenta STUDENT con nombre de 2-80 caracteres, correo único de hasta 120 y contraseña de 10-128 con mayúscula, minúscula y número. El cliente no puede elegir ADMIN.

### RF-02 · Autenticación y cierre

Validar credenciales, emitir token aleatorio de 256 bits, conservar sesión por 8 horas y revocarla al cerrar sesión.

### RF-03 · Autorización

Rechazar acceso anónimo, reservar operaciones de administración para ADMIN y limitar a STUDENT la consulta/cancelación de sus propias reservas.

### RF-04 · Catálogo

Mostrar código, nombre, categoría, descripción y estado; permitir búsqueda local por nombre, código y categoría.

### RF-05 · Gestión de equipos

Crear equipos con código único y cambiar AVAILABLE, MAINTENANCE o RETIRED; bloquear mantenimiento/retiro si existen reservas aprobadas o préstamos activos.

### RF-06 · Solicitud de reserva

Registrar equipo disponible, inicio futuro hasta 30 días, duración de 1-8 horas, precisión de minutos y propósito de 10-300 caracteres.

### RF-07 · Cupo de reservas

Limitar cada usuario a tres reservas activas: REQUESTED, APPROVED y CHECKED_OUT, incluso ante solicitudes concurrentes.

### RF-08 · Decisión administrativa

Aprobar o rechazar solicitudes REQUESTED; aprobar solo antes de iniciar y mientras equipo y horario continúen disponibles.

### RF-09 · Exclusión temporal

Impedir solapamiento de intervalos aprobados o en préstamo. Intervalos [inicio,fin): terminar exactamente cuando otro inicia es válido.

### RF-10 · Cancelación

Permitir a propietario o administrador cancelar REQUESTED o APPROVED antes del inicio. Liberar cupo y horario.

### RF-11 · Entrega del equipo

Cambiar APPROVED a CHECKED_OUT solo por ADMIN, desde 15 minutos antes del inicio hasta antes del fin, y sin otro préstamo de ese equipo pendiente de devolución.

### RF-12 · Devolución

Cambiar CHECKED_OUT a RETURNED por ADMIN una sola vez; registrar fecha y retraso en minutos, redondeado hacia arriba y nunca negativo.

### RF-13 · Resumen

Consultar conteos de reservas por estado y total de equipos. Estudiante ve sus reservas; administrador ve todas.

### RF-14 · Auditoría operacional

Registrar actor, acción, entidad y fecha para creación de reserva/equipo, cambios de estado y decisiones. Restringir consulta de los últimos 100 eventos a ADMIN.

## 2.4 Requerimientos no funcionales medibles

### RNF-01 · Rendimiento

En QA cloud, con rampa 0-50 VU en 1 min y 50 VU durante 5 min, p95 <2000 ms en catálogo y resumen; tasa de errores <1%.

Verificación: CP-61. Estado: Pendiente cloud.

### RNF-02 · Seguridad

100% de rutas protegidas probadas rechazan anónimos/roles no permitidos; sesión expira a 8 h; intento 11 falla con 429 tras diez errores; ninguna respuesta de identidad expone hashes.

Verificación: CP-08,09,11,33,45,48,57,58. Estado: Verificado local; SCA residual separado.

### RNF-03 · Consistencia

Dos aprobaciones concurrentes del mismo horario producen exactamente una aprobación; cuatro creaciones concurrentes de un usuario aceptan como máximo tres.

Verificación: CP-49,52. Estado: Verificado local; repetir con PostgreSQL cloud.

### RNF-04 · Persistencia

Tras cerrar y reabrir la misma base, se conserva el 100% de los campos del equipo de prueba; repetir después de reiniciar el backend cloud.

Verificación: CP-62,65. Estado: Verificado local; cloud pendiente.

### RNF-05 · Usabilidad y compatibilidad

Flujo login-solicitud-aprobación-historial sin errores JavaScript; sin scroll horizontal a 390 px y 1440 px; tildes del propósito conservadas.

Verificación: CP-56,63. Estado: Verificado en Chromium local.

### RNF-06 · Mantenibilidad

Al menos 30 pruebas unitarias entre backend/frontend, tres con dobles; líneas >=80% en alcance declarado y mejora >=20 puntos en módulos críticos de línea base.

Verificación: CP-64. Estado: 90 pruebas; mejora 100 pp local.

### RNF-07 · Errores controlados

Cuerpo ausente, JSON inválido y carga >16 KiB producen respectivamente 400, 400 y 413 con código/mensaje, sin trazas de servidor.

Verificación: CP-50,53,54. Estado: Verificado local.

### RNF-08 · Despliegue y acceso

Backend y frontend se construyen por separado; dos URL HTTPS operativas y accesibles desde sesión independiente; reserva conservada después del reinicio cloud.

Verificación: CP-65. Estado: Build local aprobado; cloud pendiente.

## 3. E2 · Arquitectura

### 3.1 Contexto

Los actores interactúan con un único producto. El hosting y la base se muestran como contenedores técnicos a continuación. No existe servicio de correo ni pasarela de pago en esta versión.

### 3.2 Contenedores

Frontend y backend tienen carpetas, package.json y procesos de construcción separados. Durante desarrollo se usa un proxy Vite /api hacia el proceso API. En cloud, VITE_API_URL apunta al backend HTTPS y APP_ORIGIN limita el origen permitido por CORS. La base solo es accesible al servidor.

## 3.3 Modelo de datos

Las flechas indican relaciones de uno a muchos. users.id es referenciado por sessions, reservations y audit; equipment.id por reservations. audit.entity_id identifica lógicamente equipo o reserva y no tiene una única clave foránea porque referencia dos tipos de entidad.

El esquema se encuentra en backend/src/schema.sql. Las consultas usan parámetros $1, $2, etc. Existen índices por equipo/estado/intervalo, usuario/estado, vencimiento de sesión y fecha de auditoría. Las operaciones compuestas usan una transacción con bloqueo de las filas que protegen el cupo o la disponibilidad.

### 3.4 Módulos críticos y cobertura

| Componente | Impacto y verificación |
|---|---|
| Políticas de reserva y transición | backend/src/domain.js. Un fallo admite horarios, permisos o cambios de estado inválidos. Cobertura unitaria medida contra baseline-v0. |
| Validación de presentación | frontend/src/rules.js. Un fallo produce formularios incoherentes o acciones indebidas en la interfaz. Cobertura unitaria medida contra baseline-v0. |
| Credenciales y cliente API | security.js y api.js. Pruebas unitarias adicionales; se conserva hash con sal, comparación segura y respuesta de error. |
| Orquestación transaccional y persistencia | app.js y db.js. Componentes de alto impacto cubiertos por integración HTTP, concurrencia y persistencia local. No están incluidos en la cifra de cobertura unitaria ni se declara cobertura global. Repetir contra PostgreSQL cloud. |

La mejora de 20 puntos se verifica en los dos módulos de políticas identificados para línea base. Confirmar con el catedrático si exige extender el alcance unitario a la orquestación transaccional; se declara esta limitación para evitar presentar el 100% parcial como cobertura de todos los componentes críticos.

### 3.5 Dependencias y despliegue

React y React DOM construyen la interfaz; Vite compila sus recursos. Express expone la API; pg accede a PostgreSQL externo; PGlite permite desarrollo local con persistencia. Vitest y V8 generan pruebas/cobertura; Newman ejecuta Postman; k6 prepara carga. Google Fonts es una dependencia visual opcional con fuentes de sistema de respaldo. El archivo package-lock.json fija las versiones instaladas.

## 4. E3 · Diseño de pruebas

Se diseñaron 65 casos: 60 funcionales HTTP y cinco verificaciones no funcionales. El catálogo completo está en 02_Casos_y_trazabilidad.pdf y en qa/casos-completos.json. Cada ficha identifica requisito, técnica, precondiciones, datos, pasos, esperado y prioridad. Se utilizaron explícitamente las cuatro técnicas exigidas.

| Técnica | Aplicación concreta |
|---|---|
| Partición de equivalencia | Correos válidos/ inválidos, existencia de equipo, acceso a catálogo, caracteres acentuados. |
| Valores límite | Duraciones 59, 60, 480 y 481 min; propósitos 9, 10, 300 y 301 caracteres; anticipación 30 días; máximo tres reservas. |
| Tabla de decisión | Actor con/sin permiso, credencial válida/inválida, disponibilidad y conflicto, préstamo anterior pendiente. |
| Transición de estados | Solicitud, aprobación/rechazo, cancelación, entrega, devolución y rechazo de transiciones inválidas. |

### 4.1 Tabla de decisión de aprobación

| Regla | ADMIN | REQUESTED | Futura | Equipo libre | Sin conflicto | Resultado |
|---|---|---|---|---|---|---|
| D1 | No | - | - | - | - | 403 |
| D2 | Sí | No | - | - | - | 409 STATE |
| D3 | Sí | Sí | No | - | - | 409 STARTED |
| D4 | Sí | Sí | Sí | No | - | 409 EQUIPMENT |
| D5 | Sí | Sí | Sí | Sí | No | 409 CONFLICT |
| D6 | Sí | Sí | Sí | Sí | Sí | 200 APPROVED |

### 4.2 Tabla de estados

| Origen | Evento | Destino | Condiciones |
|---|---|---|---|
| REQUESTED | approve | APPROVED | ADMIN; futura; disponible; sin conflicto |
| REQUESTED | reject | REJECTED | ADMIN |
| REQUESTED / APPROVED | cancel | CANCELLED | Propietario o ADMIN; antes de inicio |
| APPROVED | checkout | CHECKED_OUT | ADMIN; ventana de entrega; sin préstamo anterior |
| CHECKED_OUT | return | RETURNED | ADMIN; registrar devolución única |

## 5. E4 · Trazabilidad y cobertura de requisitos

Todos los 14 RF y 8 RNF tienen al menos un caso diseñado. Tener diseño no significa que exista ejecución: RNF-01 y RNF-08 conservan verificación cloud pendiente; persistencia y concurrencia tienen resultados locales que deben repetirse sobre el despliegue. La matriz distingue explícitamente esas situaciones.

DEF-01 afecta RNF-07 mediante CP-50; DEF-02 afecta RF-11 mediante CP-51; DEF-03 afecta RF-05 mediante CP-59. Los tres fueron reproducidos y cerrados localmente. Los hallazgos SCA se vinculan al control de seguridad del toolchain y permanecen separados del resultado funcional.

## 6. E5 · Ejecución y métricas

| Métrica | Inicial | Regresión |
|---|---|---|
| Casos funcionales ejecutados | 60 | 60 |
| Aprobados | 57 | 60 |
| Fallidos | 3 | 0 |
| Tasa de aprobación | 95,00% | 100,00% |
| Defectos funcionales distintos | 3 | 0 abiertos / 3 cerrados |
| Entorno | Local, HTTP real, PGlite aislado | Local, mismo catálogo de casos |

Tasa de aprobación = casos aprobados / casos ejecutados ×100. El reloj se inyecta en las pruebas para verificar vencimiento, ventana de entrega y retraso sin esperar horas reales. Esta inyección solo existe en la construcción de prueba createApp; no hay endpoint que permita alterar el reloj del servidor productivo.

| Severidad funcional | Cantidad |
|---|---|
| Alta | 1: DEF-02 |
| Media | 1: DEF-01 |
| Baja | 1: DEF-03 |

### 6.1 Densidad de defectos por módulo

| Módulo | Casos | Defectos | Defectos/caso |
|---|---|---|---|
| Autenticación | 12 | 1 | 0.083 |
| Equipos | 6 | 1 | 0.167 |
| Préstamos | 7 | 1 | 0.143 |
| Reservas | 23 | 0 | 0.000 |
| Seguridad/consistencia | 9 | 0 | 0.000 |
| Resumen/auditoría/otros | 3 | 0 | 0.000 |

Se define densidad operacional como defectos funcionales distintos del módulo / casos ejecutados del módulo. No se usa KLOC ni se mezclan hallazgos de dependencias. La suma de defectos es tres; varios casos podrían apuntar al mismo defecto sin contarlo varias veces.

### 6.2 Gestión en herramienta

Está preparado qa/TestLink_Casos.xml con 65 casos y scripts/import-testlink.py para registrar resultados existentes mediante XML-RPC. No se tuvo acceso a una instancia TestLink durante la preparación. Por tanto, E5 no está acreditado como ejecución en herramienta profesional. Antes de entregar: crear proyecto/plan/builds, importar casos, registrar resultados, adjuntar evidencia y obtener captura del reporte de TestLink.

## 6.3 Diez fichas de hallazgos y su alcance

Se documentan tres defectos funcionales y siete hallazgos reales de análisis de dependencias (SCA). Estos últimos afectan herramientas de desarrollo, principalmente Newman, no constituyen siete fallos funcionales demostrados ni resultados de SonarQube. Su eventual aceptación para el mínimo de diez defectos de E5 debe confirmarse con el catedrático. Si exige diez defectos de ejecución de la aplicación, faltan siete; no se han fabricado defectos para llenar el número.

### DEF-01 · Login sin cuerpo provoca HTTP 500

| Campo | Detalle |
|---|---|
| Tipo / módulo | Funcional / Autenticación |
| Severidad / prioridad | Media / Alta |
| Trazabilidad | RNF-07 / CP-50 |
| Reproducción | Sin sesión, enviar POST /api/auth/login sin cuerpo y sin Content-Type. |
| Esperado | HTTP 400 BODY con mensaje controlado. |
| Obtenido | HTTP 500 INTERNAL; TypeError en el servidor. |
| Estado / solución | Cerrado local. Middleware valida objeto JSON antes del handler. |
| Evidencia | qa/evidencias/funcionales-inicial.json: CP-50; regresión en funcionales.json. |

### DEF-02 · Entrega de equipo todavía prestado

| Campo | Detalle |
|---|---|
| Tipo / módulo | Funcional / Préstamos |
| Severidad / prioridad | Alta / Crítica |
| Trazabilidad | RF-11 / CP-51 |
| Reproducción | Crear y aprobar A de T+1h a T+2h y B de T+2h a T+3h. Entregar A al iniciar. No devolver A. Avanzar reloj a T+2h y solicitar entrega de B. |
| Esperado | HTTP 409 OUTSTANDING_LOAN; permanece APPROVED. |
| Obtenido | HTTP 200 CHECKED_OUT: dos préstamos del mismo equipo simultáneos. |
| Estado / solución | Cerrado local. Bloqueo de fila de equipo y consulta de préstamo sin devolver dentro de la transacción. |
| Evidencia | qa/evidencias/funcionales-inicial.json: CP-51; regresión en funcionales.json. |

### DEF-03 · Respuesta de equipo no coincide con dato persistido

| Campo | Detalle |
|---|---|
| Tipo / módulo | Funcional / Equipos |
| Severidad / prioridad | Baja / Media |
| Trazabilidad | RF-05 / CP-59 |
| Reproducción | Administrador crea equipo con nombre " Generador de señales ". Comparar la respuesta POST con GET /api/equipment. |
| Esperado | POST y GET presentan el mismo nombre sin espacios externos. |
| Obtenido | POST conserva espacios; GET devuelve el nombre normalizado. |
| Estado / solución | Cerrado local. Normalizar nombre, categoría y descripción también en la respuesta. |
| Evidencia | qa/evidencias/funcionales-inicial.json: CP-59; regresión en funcionales.json. |

### DEF-04 · Dependencia vulnerable: handlebars

| Campo | Detalle |
|---|---|
| Tipo / módulo | Hallazgo SCA (herramientas de desarrollo) / Toolchain Newman |
| Severidad / prioridad | Crítica / Alta |
| Trazabilidad | RNF-02 / SCA-01 |
| Reproducción | Restaurar tag baseline-v0 o commit e7fb6bf en una carpeta de evaluación; npm ci; npm audit --json; localizar el paquete indicado y su advisory. El reporte histórico incluido conserva el hallazgo aun si cambia el registro remoto. |
| Esperado | La versión instalada no coincide con un rango vulnerable informado por npm audit. |
| Obtenido | Handlebars.js has JavaScript Injection via AST Type Confusion; rango afectado >=4.0.0 <=4.7.8. No se ejecutó un exploit. |
| Estado / solución | Cerrado por actualización. Override de versión y regresión Newman aprobada. |
| Evidencia | qa/evidencias/dependencias-audit.json y dependencias-audit-final.json; clave handlebars. Referencia: https://github.com/advisories/GHSA-2w6w-674q-4c4q |

### DEF-05 · Dependencia vulnerable: flatted

| Campo | Detalle |
|---|---|
| Tipo / módulo | Hallazgo SCA (herramientas de desarrollo) / Toolchain Newman |
| Severidad / prioridad | Alta / Alta |
| Trazabilidad | RNF-02 / SCA-01 |
| Reproducción | Restaurar tag baseline-v0 o commit e7fb6bf en una carpeta de evaluación; npm ci; npm audit --json; localizar el paquete indicado y su advisory. El reporte histórico incluido conserva el hallazgo aun si cambia el registro remoto. |
| Esperado | La versión instalada no coincide con un rango vulnerable informado por npm audit. |
| Obtenido | flatted vulnerable to unbounded recursion DoS in parse() revive phase; rango afectado <3.4.0. No se ejecutó un exploit. |
| Estado / solución | Cerrado por actualización. Override de versión y regresión Newman aprobada. |
| Evidencia | qa/evidencias/dependencias-audit.json y dependencias-audit-final.json; clave flatted. Referencia: https://github.com/advisories/GHSA-25h7-pfq9-p65f |

### DEF-06 · Dependencia vulnerable: lodash

| Campo | Detalle |
|---|---|
| Tipo / módulo | Hallazgo SCA (herramientas de desarrollo) / Toolchain Newman |
| Severidad / prioridad | Alta / Alta |
| Trazabilidad | RNF-02 / SCA-01 |
| Reproducción | Restaurar tag baseline-v0 o commit e7fb6bf en una carpeta de evaluación; npm ci; npm audit --json; localizar el paquete indicado y su advisory. El reporte histórico incluido conserva el hallazgo aun si cambia el registro remoto. |
| Esperado | La versión instalada no coincide con un rango vulnerable informado por npm audit. |
| Obtenido | lodash vulnerable to Code Injection via `_.template` imports key names; rango afectado >=4.0.0 <=4.17.23. No se ejecutó un exploit. |
| Estado / solución | Cerrado por actualización. Override de versión y regresión Newman aprobada. |
| Evidencia | qa/evidencias/dependencias-audit.json y dependencias-audit-final.json; clave lodash. Referencia: https://github.com/advisories/GHSA-r5fr-rjxr-66jc |

### DEF-07 · Dependencia vulnerable: node-forge

| Campo | Detalle |
|---|---|
| Tipo / módulo | Hallazgo SCA (herramientas de desarrollo) / Toolchain Newman |
| Severidad / prioridad | Alta / Alta |
| Trazabilidad | RNF-02 / SCA-01 |
| Reproducción | Restaurar tag baseline-v0 o commit e7fb6bf en una carpeta de evaluación; npm ci; npm audit --json; localizar el paquete indicado y su advisory. El reporte histórico incluido conserva el hallazgo aun si cambia el registro remoto. |
| Esperado | La versión instalada no coincide con un rango vulnerable informado por npm audit. |
| Obtenido | node-forge has ASN.1 Unbounded Recursion; rango afectado <1.3.2. No se ejecutó un exploit. |
| Estado / solución | Cerrado por actualización. Override de versión y regresión Newman aprobada. |
| Evidencia | qa/evidencias/dependencias-audit.json y dependencias-audit-final.json; clave node-forge. Referencia: https://github.com/advisories/GHSA-554w-wpv2-vw27 |

### DEF-08 · Dependencia vulnerable: @faker-js/faker

| Campo | Detalle |
|---|---|
| Tipo / módulo | Hallazgo SCA (herramientas de desarrollo) / Toolchain Newman |
| Severidad / prioridad | Alta / Alta |
| Trazabilidad | RNF-02 / SCA-01 |
| Reproducción | Restaurar tag baseline-v0 o commit e7fb6bf en una carpeta de evaluación; npm ci; npm audit --json; localizar el paquete indicado y su advisory. El reporte histórico incluido conserva el hallazgo aun si cambia el registro remoto. |
| Esperado | La versión instalada no coincide con un rango vulnerable informado por npm audit. |
| Obtenido | Faker: helpers.fake exploitable into arbritary code execution; rango afectado <=10.4.0. No se ejecutó un exploit. |
| Estado / solución | Abierto: dependencia de herramienta. Evaluar una actualización compatible del ejecutor/paquete; mientras tanto usar solo colecciones propias en QA aislado. No declarar remediado. |
| Evidencia | qa/evidencias/dependencias-audit.json y dependencias-audit-final.json; clave @faker-js/faker. Referencia: https://github.com/advisories/GHSA-qxc2-j82w-r537 |

### DEF-09 · Dependencia vulnerable: csv-parse

| Campo | Detalle |
|---|---|
| Tipo / módulo | Hallazgo SCA (herramientas de desarrollo) / Toolchain Newman |
| Severidad / prioridad | Media / Media |
| Trazabilidad | RNF-02 / SCA-01 |
| Reproducción | Restaurar tag baseline-v0 o commit e7fb6bf en una carpeta de evaluación; npm ci; npm audit --json; localizar el paquete indicado y su advisory. El reporte histórico incluido conserva el hallazgo aun si cambia el registro remoto. |
| Esperado | La versión instalada no coincide con un rango vulnerable informado por npm audit. |
| Obtenido | node-csv: Prototype replacement still reachable via columns path; rango afectado <7.0.2. No se ejecutó un exploit. |
| Estado / solución | Abierto: dependencia de herramienta. Evaluar una actualización compatible del ejecutor/paquete; mientras tanto usar solo colecciones propias en QA aislado. No declarar remediado. |
| Evidencia | qa/evidencias/dependencias-audit.json y dependencias-audit-final.json; clave csv-parse. Referencia: https://github.com/advisories/GHSA-8cw4-87c7-c6xx |

### DEF-10 · Dependencia vulnerable: underscore

| Campo | Detalle |
|---|---|
| Tipo / módulo | Hallazgo SCA (herramientas de desarrollo) / Toolchain Newman |
| Severidad / prioridad | Alta / Alta |
| Trazabilidad | RNF-02 / SCA-01 |
| Reproducción | Restaurar tag baseline-v0 o commit e7fb6bf en una carpeta de evaluación; npm ci; npm audit --json; localizar el paquete indicado y su advisory. El reporte histórico incluido conserva el hallazgo aun si cambia el registro remoto. |
| Esperado | La versión instalada no coincide con un rango vulnerable informado por npm audit. |
| Obtenido | Underscore has unlimited recursion in _.flatten and _.isEqual, potential for DoS attack; rango afectado <=1.13.7. No se ejecutó un exploit. |
| Estado / solución | Abierto: dependencia de herramienta. Evaluar una actualización compatible del ejecutor/paquete; mientras tanto usar solo colecciones propias en QA aislado. No declarar remediado. |
| Evidencia | qa/evidencias/dependencias-audit.json y dependencias-audit-final.json; clave underscore. Referencia: https://github.com/advisories/GHSA-qpx9-hpmf-5gmw |

## 7. E6-E8 · Estado de cierre

E6: se entrega configuración de despliegue separado y PostgreSQL persistente; falta crear recursos y verificar una URL pública. E7: se entrega pauta de defensa, no video. E8: se entrega ficha de reflexión individual para que Erick la complete con su experiencia. Estos componentes no se marcan cumplidos por existir una plantilla.

### 8. Conclusiones

La regresión local confirma las 60 expectativas funcionales del catálogo. La ejecución inicial descubrió tres fallos con impacto distinto y la segunda corrida verificó sus correcciones. La separación de políticas, interfaz y persistencia permite evaluar reglas aisladas y flujos HTTP completos. Aun así, el producto no puede declararse listo para la entrega académica completa hasta integrar la herramienta de pruebas, el despliegue cloud, los requisitos de defectos, la defensa y la bitácora.

## 9. Evidencias visuales

Captura real del catálogo en Chromium. Fuente: qa/evidencias/capturas/02-catalogo-admin.png. Datos de demostración, no inventario de una institución real.

## 10. Declaración de IA y referencias

La IA produjo el código inicial, la documentación, las pruebas, el material de preparación y los archivos de configuración; ejecutó pruebas locales y corrigió tres defectos reproducidos. El historial local identifica expresamente esa asistencia. No se atribuyen commits de IA a trabajo manual del estudiante.

El anexo completo se incluye en docs/ANEXO_IA.md con las solicitudes y la especificación utilizadas. El historial identifica commits de asistencia IA; no se atribuyen a trabajo manual del estudiante.

Referencia normativa: Universidad Mariano Gálvez de Guatemala, Enunciado del Proyecto Final de Aseguramiento de la Calidad de Software 2026, 13 páginas; secciones 2-5 y 7. Documentación técnica: https://pglite.dev/docs/api ; https://vitest.dev/config/coverage ; https://learning.postman.com/docs/reference/newman-cli/installing-running-newman/ . Consulta: 25/09/2026.
