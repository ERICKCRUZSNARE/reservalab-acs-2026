# Casos de prueba y trazabilidad

65 casos diseñados, cuatro técnicas formales y estado de ejecución por requisito.

Documento técnico - ejecución local verificada

## 1. Convenciones de ejecución

T es el instante de referencia redondeado a minuto completo. Para los 60 casos HTTP se inicializa una base aislada con usuarios admin, student y other; LAB-001, 002 y 003 disponibles; LAB-004 en mantenimiento. Cada caso reinicia reservas, auditoría y sesiones, autentica las tres cuentas y luego ejecuta su escenario. Inicio normal=T+1h; fin=T+2h; propósito normal="Práctica de laboratorio". Las contraseñas son las del entorno demo, no credenciales reales.

Una entrada rechazada correctamente es una prueba aprobada: por ejemplo, esperar 409 y recibir 409 no significa que el software tenga un defecto. Los defectos se detectan cuando el resultado obtenido difiere del esperado. El video que exige un caso fallido debe mostrar una discrepancia real, como CP-51 sobre baseline-v0, y luego explicar su corrección.

| Estado | Significado |
|---|---|
| Aprobado local | Existe salida reproducible en qa/evidencias. No implica registro ya realizado en TestLink. |
| Fallido inicial / cerrado | Se conserva la corrida inicial con el defecto y una regresión aprobada. |
| Pendiente | El diseño y script existen, pero falta ejecutar la verificación indicada. |

## 2. Matriz de trazabilidad

| Requisito | Casos asociados | Ejecución | Defectos |
|---|---|---|---|
| RF-01 | CP-01, CP-02, CP-03, CP-04, CP-05 | Aprobado local | Sin defecto funcional |
| RF-02 | CP-06, CP-07, CP-09, CP-47 | Aprobado local | Sin defecto funcional |
| RF-03 | CP-08, CP-11, CP-33, CP-45, CP-58 | Aprobado local | Sin defecto funcional |
| RF-04 | CP-10 | Aprobado local | Sin defecto funcional |
| RF-05 | CP-12, CP-13, CP-42, CP-43, CP-59 | Aprobado local | DEF-03 |
| RF-06 | CP-14, CP-15, CP-16, CP-17, CP-18, CP-19, CP-20, CP-21, CP-22, CP-23, CP-24, CP-25, CP-55 | Aprobado local | Sin defecto funcional |
| RF-07 | CP-26, CP-27 | Aprobado local | Sin defecto funcional |
| RF-08 | CP-28, CP-60 | Aprobado local | Sin defecto funcional |
| RF-09 | CP-29, CP-30, CP-31 | Aprobado local | Sin defecto funcional |
| RF-10 | CP-32, CP-34, CP-35 | Aprobado local | Sin defecto funcional |
| RF-11 | CP-36, CP-37, CP-51 | Aprobado local | DEF-02 |
| RF-12 | CP-38, CP-39, CP-40, CP-41 | Aprobado local | Sin defecto funcional |
| RF-13 | CP-46 | Aprobado local | Sin defecto funcional |
| RF-14 | CP-44 | Aprobado local | Sin defecto funcional |
| RNF-01 | CP-61 | Pendiente cloud | Sin defecto funcional |
| RNF-02 | CP-08, CP-09, CP-11, CP-33, CP-45, CP-48, CP-57, CP-58 | Aprobado local | Sin defecto funcional |
| RNF-03 | CP-49, CP-52 | Aprobado local | Sin defecto funcional |
| RNF-04 | CP-62, CP-65 | Local aprobado; cloud pendiente | Sin defecto funcional |
| RNF-05 | CP-56, CP-63 | Aprobado local | Sin defecto funcional |
| RNF-06 | CP-64 | Aprobado local | Sin defecto funcional |
| RNF-07 | CP-50, CP-53, CP-54 | Aprobado local | DEF-01 |
| RNF-08 | CP-65 | Pendiente cloud | Sin defecto funcional |

Cobertura de diseño: 22/22 requisitos (100%). Cobertura de ejecución cloud: pendiente para RNF-01 y RNF-08. La matriz es un mapa de cobertura, no una declaración de cumplimiento total. DEF-01/02/03 están cerrados localmente. Los SCA se consultan en el registro separado de defectos.

## 3. Distribución por técnica

| Técnica | Casos diseñados |
|---|---|
| Partición de equivalencia | 13 |
| Valores límite | 25 |
| Tabla de decisión | 16 |
| Transición de estados | 11 |

## 4. Fichas de casos

### CP-01 · Registrar estudiante válido

| Campo | Detalle |
|---|---|
| Requerimiento | RF-01 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Nombre Erick; correo erick@example.test; clave Segura2026! |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201; rol STUDENT |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/register -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-01.

### CP-02 · Rechazar correo duplicado

| Campo | Detalle |
|---|---|
| Requerimiento | RF-01 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | alumno@reservalab.test |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 DUPLICATE |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/register -> HTTP 409
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-02.

### CP-03 · Rechazar correo sin arroba

| Campo | Detalle |
|---|---|
| Requerimiento | RF-01 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | correo=incorrecto |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 422 EMAIL |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/register -> HTTP 422
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-03.

### CP-04 · Contraseña de 9 caracteres

| Campo | Detalle |
|---|---|
| Requerimiento | RF-01 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Abcdefg12 (9 caracteres) |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 422 PASSWORD |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/register -> HTTP 422
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-04.

### CP-05 · Contraseña de 10 caracteres

| Campo | Detalle |
|---|---|
| Requerimiento | RF-01 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Abcdefgh12 (10 caracteres) |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/register -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-05.

### CP-06 · Credenciales válidas

| Campo | Detalle |
|---|---|
| Requerimiento | RF-02 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Correo existente y clave correcta |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200; token emitido |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/login -> HTTP 200
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-06.

### CP-07 · Credenciales inválidas

| Campo | Detalle |
|---|---|
| Requerimiento | RF-02 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Correo existente y clave incorrecta |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 401 LOGIN |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/login -> HTTP 401
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-07.

### CP-08 · Recurso protegido sin sesión

| Campo | Detalle |
|---|---|
| Requerimiento | RF-03 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Sin Authorization |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 401 AUTH |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. GET /api/equipment -> HTTP 401
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-08.

### CP-09 · Sesión vencida a las 8 horas

| Campo | Detalle |
|---|---|
| Requerimiento | RF-02 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | T=emisión+8 horas |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 401 AUTH |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. GET /api/auth/me -> HTTP 401
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-09.

### CP-10 · Consultar catálogo

| Campo | Detalle |
|---|---|
| Requerimiento | RF-04 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Usuario autenticado |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200; cuatro equipos |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. GET /api/equipment -> HTTP 200
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-10.

### CP-11 · Estudiante no crea equipos

| Campo | Detalle |
|---|---|
| Requerimiento | RF-03 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Rol STUDENT; equipo válido |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 403 FORBIDDEN |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/equipment -> HTTP 403
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-11.

### CP-12 · Administrador crea equipo

| Campo | Detalle |
|---|---|
| Requerimiento | RF-05 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Rol ADMIN; código libre |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201; equipo disponible |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/equipment -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-12.

### CP-13 · Código de equipo duplicado

| Campo | Detalle |
|---|---|
| Requerimiento | RF-05 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Código LAB-001 existente |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 DUPLICATE |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/equipment -> HTTP 409
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-13.

### CP-14 · Reserva de equipo en mantenimiento

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | eq-4; horario válido |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 EQUIPMENT |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 409
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-14.

### CP-15 · Propósito de 9 caracteres

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Propósito='a' repetido 9 veces |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 422 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 422
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-15.

### CP-16 · Propósito de 10 caracteres

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Propósito='a' repetido 10 veces |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-16.

### CP-17 · Propósito de 300 caracteres

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Propósito='a' repetido 300 veces |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-17.

### CP-18 · Propósito de 301 caracteres

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Propósito='a' repetido 301 veces |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 422 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 422
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-18.

### CP-19 · Duración de 59 minutos

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Inicio=T+60 min; fin=inicio+59 min |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 422 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 422
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-19.

### CP-20 · Duración de 60 minutos

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Inicio=T+60 min; fin=inicio+60 min |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-20.

### CP-21 · Duración de 480 minutos

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Inicio=T+60 min; fin=inicio+480 min |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-21.

### CP-22 · Duración de 481 minutos

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Inicio=T+60 min; fin=inicio+481 min |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 422 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 422
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-22.

### CP-23 · Inicio igual al instante actual

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | start=T |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 422 PAST |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 422
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-23.

### CP-24 · Anticipación exacta de 30 días

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | start=T+30 días |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-24.

### CP-25 · Anticipación superior a 30 días

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | start=T+30 días+1 min |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 422 ADVANCE |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 422
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-25.

### CP-26 · Tres reservas activas permitidas

| Campo | Detalle |
|---|---|
| Requerimiento | RF-07 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Tres solicitudes futuras de un estudiante |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Tres HTTP 201 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations -> HTTP 201
3. POST /api/reservations -> HTTP 201
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-26.

### CP-27 · Cuarta reserva activa bloqueada

| Campo | Detalle |
|---|---|
| Requerimiento | RF-07 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Usuario con tres solicitudes |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 LIMIT |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations -> HTTP 201
3. POST /api/reservations -> HTTP 201
4. POST /api/reservations -> HTTP 409
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200
7. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-27.

### CP-28 · Aprobar solicitud

| Campo | Detalle |
|---|---|
| Requerimiento | RF-08 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | REQUESTED; administrador; equipo libre |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200; APPROVED |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/b544cdf9-da8a-47a6-8472-48d68f7aa6ec/approve -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-28.

### CP-29 · Solapamiento con reserva aprobada

| Campo | Detalle |
|---|---|
| Requerimiento | RF-09 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | A aprobada [T+1h,T+2h); B [T+90min,T+150min) |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 CONFLICT |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/7d997c32-ae2b-43e4-85ee-3cc775ef8515/approve -> HTTP 200
3. POST /api/reservations -> HTTP 409
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-29.

### CP-30 · Horarios contiguos permitidos

| Campo | Detalle |
|---|---|
| Requerimiento | RF-09 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | A [T+1h,T+2h); B [T+2h,T+3h) |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 201 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/48df09ed-9e78-4b3f-8821-29e3efbb78d1/approve -> HTTP 200
3. POST /api/reservations -> HTTP 201
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-30.

### CP-31 · Segunda aprobación sobre horario ocupado

| Campo | Detalle |
|---|---|
| Requerimiento | RF-09 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Dos pendientes mismo horario; aprobar A y luego B |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Primera 200; segunda 409 CONFLICT |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations -> HTTP 201
3. POST /api/reservations/778272fe-20a4-4ceb-a77e-183322bfddcf/approve -> HTTP 200
4. POST /api/reservations/5d2b6c02-fb6e-4d8c-898c-6d45977c3a3c/approve -> HTTP 409
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200
7. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-31.

### CP-32 · Cancelar solicitud propia

| Campo | Detalle |
|---|---|
| Requerimiento | RF-10 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | REQUESTED; usuario propietario |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200 CANCELLED |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/1eeb2067-18df-4af8-9513-8c3bfd8d7bee/cancel -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-32.

### CP-33 · Cancelar solicitud ajena prohibido

| Campo | Detalle |
|---|---|
| Requerimiento | RF-03 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | REQUESTED; otro estudiante |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 403 FORBIDDEN |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/d0f37fbf-e0c5-4b25-a716-b93535519517/cancel -> HTTP 403
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-33.

### CP-34 · Cancelar reserva aprobada

| Campo | Detalle |
|---|---|
| Requerimiento | RF-10 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | APPROVED; antes del inicio |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200 CANCELLED |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/1aabd561-37a7-4762-9ac8-fa26619cac5e/approve -> HTTP 200
3. POST /api/reservations/1aabd561-37a7-4762-9ac8-fa26619cac5e/cancel -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-34.

### CP-35 · Cancelar al inicio prohibido

| Campo | Detalle |
|---|---|
| Requerimiento | RF-10 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | APPROVED; T=start |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 STARTED |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/adb5f11b-02f7-483d-b200-6de850d93a42/approve -> HTTP 200
3. POST /api/reservations/adb5f11b-02f7-483d-b200-6de850d93a42/cancel -> HTTP 409
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-35.

### CP-36 · Entrega 15 minutos antes

| Campo | Detalle |
|---|---|
| Requerimiento | RF-11 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | APPROVED; T=start-15 min |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200 CHECKED_OUT |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/36bd5ea6-4f3a-469a-b424-21e9452421ca/approve -> HTTP 200
3. POST /api/reservations/36bd5ea6-4f3a-469a-b424-21e9452421ca/checkout -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-36.

### CP-37 · Entrega 16 minutos antes prohibida

| Campo | Detalle |
|---|---|
| Requerimiento | RF-11 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | APPROVED; T=start-16 min |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 CHECKOUT_TIME |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/1552734a-b29e-4fa8-87dc-16950eba98bf/approve -> HTTP 200
3. POST /api/reservations/1552734a-b29e-4fa8-87dc-16950eba98bf/checkout -> HTTP 409
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-37.

### CP-38 · Devolución normal

| Campo | Detalle |
|---|---|
| Requerimiento | RF-12 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | REQUESTED → APPROVED → CHECKED_OUT → RETURNED |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200 RETURNED; retraso=0 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/0932cb02-ad14-45fb-8d13-e6d14dd25c2c/approve -> HTTP 200
3. POST /api/reservations/0932cb02-ad14-45fb-8d13-e6d14dd25c2c/checkout -> HTTP 200
4. POST /api/reservations/0932cb02-ad14-45fb-8d13-e6d14dd25c2c/return -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200
7. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-38.

### CP-39 · No devolver una solicitud

| Campo | Detalle |
|---|---|
| Requerimiento | RF-12 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | REQUESTED → RETURNED |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 STATE |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/8f4e288a-1fdb-419b-885f-37ae7916a282/return -> HTTP 409
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-39.

### CP-40 · No devolver dos veces

| Campo | Detalle |
|---|---|
| Requerimiento | RF-12 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | RETURNED → RETURNED |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 STATE |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/b6e1d62e-d906-49ec-96fa-069dcd3abfd9/approve -> HTTP 200
3. POST /api/reservations/b6e1d62e-d906-49ec-96fa-069dcd3abfd9/checkout -> HTTP 200
4. POST /api/reservations/b6e1d62e-d906-49ec-96fa-069dcd3abfd9/return -> HTTP 200
5. POST /api/reservations/b6e1d62e-d906-49ec-96fa-069dcd3abfd9/return -> HTTP 409
6. POST /api/auth/login -> HTTP 200
7. POST /api/auth/login -> HTTP 200
8. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-40.

### CP-41 · Redondeo del retraso

| Campo | Detalle |
|---|---|
| Requerimiento | RF-12 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Devolución 61 segundos después del fin |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | late_minutes=2 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/67f4a7f7-3517-482d-a251-a842267aa8ba/approve -> HTTP 200
3. POST /api/reservations/67f4a7f7-3517-482d-a251-a842267aa8ba/checkout -> HTTP 200
4. POST /api/reservations/67f4a7f7-3517-482d-a251-a842267aa8ba/return -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200
7. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-41.

### CP-42 · Mantenimiento con compromiso bloqueado

| Campo | Detalle |
|---|---|
| Requerimiento | RF-05 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Equipo con reserva APPROVED |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 COMMITTED |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/b751d969-3cf7-43d0-907a-2770096d8f5e/approve -> HTTP 200
3. PATCH /api/equipment/eq-1/status -> HTTP 409
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-42.

### CP-43 · Activar mantenimiento sin compromisos

| Campo | Detalle |
|---|---|
| Requerimiento | RF-05 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | AVAILABLE → MAINTENANCE |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200 MAINTENANCE |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. PATCH /api/equipment/eq-1/status -> HTTP 200
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-43.

### CP-44 · Auditar creación y aprobación

| Campo | Detalle |
|---|---|
| Requerimiento | RF-14 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Crear reserva y aprobarla |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Dos eventos con actor, entidad y fecha |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/d11fb0f2-63aa-48f2-8318-6a52097fd8a0/approve -> HTTP 200
3. GET /api/audit -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-44.

### CP-45 · Privacidad de reservas

| Campo | Detalle |
|---|---|
| Requerimiento | RF-03 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Reserva de estudiante A; consulta B |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | B no recibe reservas de A |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. GET /api/reservations -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-45.

### CP-46 · Resumen por estado

| Campo | Detalle |
|---|---|
| Requerimiento | RF-13 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Una reserva solicitada |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | counts.REQUESTED=1; equipment=4 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. GET /api/dashboard -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-46.

### CP-47 · Cerrar sesión revoca token

| Campo | Detalle |
|---|---|
| Requerimiento | RF-02 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Token válido → logout → consulta |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Logout 200; consulta 401 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/logout -> HTTP 200
2. GET /api/auth/me -> HTTP 401
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-47.

### CP-48 · Bloqueo de intentos de acceso

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-02 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Diez intentos fallidos; undécimo intento |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Diez 401; undécimo 429 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/login -> HTTP 401
2. POST /api/auth/login -> HTTP 401
3. POST /api/auth/login -> HTTP 401
4. POST /api/auth/login -> HTTP 401
5. POST /api/auth/login -> HTTP 401
6. POST /api/auth/login -> HTTP 401
7. POST /api/auth/login -> HTTP 401
8. POST /api/auth/login -> HTTP 401
9. POST /api/auth/login -> HTTP 401
10. POST /api/auth/login -> HTTP 401
11. POST /api/auth/login -> HTTP 429
12. POST /api/auth/login -> HTTP 200
13. POST /api/auth/login -> HTTP 200
14. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-48.

### CP-49 · Aprobación simultánea consistente

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-03 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Dos pendientes mismo equipo y horario; aprobar concurrentemente |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Exactamente una 200 y una 409 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations -> HTTP 201
3. POST /api/reservations/c9280767-bf6f-4f17-802e-a5bf898772d9/approve -> HTTP 200
4. POST /api/reservations/56dbd6ee-4344-41f6-9866-98344af570ee/approve -> HTTP 409
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200
7. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-49.

### CP-50 · Login sin cuerpo manejado

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-07 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | POST /auth/login sin Content-Type ni cuerpo |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 400 BODY; nunca 500 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/login -> HTTP 400
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Fallido. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-50.

Discrepancia inicial: Esperado HTTP 400 / BODY; obtenido HTTP 500 / INTERNAL

### CP-51 · No entregar equipo con préstamo sin devolver

| Campo | Detalle |
|---|---|
| Requerimiento | RF-11 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | A [T+1h,T+2h) prestada y vencida; B [T+2h,T+3h) aprobada; entregar B |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 409 OUTSTANDING_LOAN |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/e61e9d17-d085-4a76-90e0-983b9542d5db/approve -> HTTP 200
3. POST /api/reservations -> HTTP 201
4. POST /api/reservations/80f7aed8-7a7b-44de-a3aa-0dbedd1142f8/approve -> HTTP 200
5. POST /api/reservations/e61e9d17-d085-4a76-90e0-983b9542d5db/checkout -> HTTP 200
6. POST /api/reservations/80f7aed8-7a7b-44de-a3aa-0dbedd1142f8/checkout -> HTTP 409
7. POST /api/auth/login -> HTTP 200
8. POST /api/auth/login -> HTTP 200
9. POST /api/auth/login -> HTTP 200

Inicial: Fallido. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-51.

Discrepancia inicial: Esperado HTTP 409 / OUTSTANDING_LOAN; obtenido HTTP 200 / CHECKED_OUT

### CP-52 · Límite de reservas con concurrencia

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-03 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Cuatro creaciones simultáneas del mismo usuario |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Tres 201 y una 409 |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations -> HTTP 201
3. POST /api/reservations -> HTTP 201
4. POST /api/reservations -> HTTP 409
5. POST /api/auth/login -> HTTP 200
6. POST /api/auth/login -> HTTP 200
7. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-52.

### CP-53 · JSON mal formado manejado

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-07 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | POST /auth/login; cuerpo {invalido |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 400 JSON |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/login -> HTTP 400
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-53.

### CP-54 · Límite de tamaño del cuerpo

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-07 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | JSON con más de 16 KiB |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 413 SIZE |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/login -> HTTP 413
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-54.

### CP-55 · Equipo inexistente

| Campo | Detalle |
|---|---|
| Requerimiento | RF-06 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | equipment_id=no-existe |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 404 NOT_FOUND |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 404
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-55.

### CP-56 · Datos con tildes conservados

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-05 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Propósito=Medición de tensión y señal óptica |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Mismo propósito recuperado |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. GET /api/reservations -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-56.

### CP-57 · No exponer hash de contraseña

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-02 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | GET /auth/me |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Respuesta sin password ni password_hash |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. GET /api/auth/me -> HTTP 200
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-57.

### CP-58 · Registro no permite escalar privilegios

| Campo | Detalle |
|---|---|
| Requerimiento | RF-03 |
| Técnica / prioridad | Tabla de decisión / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Registro con role=ADMIN |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | Cuenta creada con STUDENT |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/auth/register -> HTTP 201
2. POST /api/auth/login -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-58.

### CP-59 · Respuesta de creación consistente con consulta

| Campo | Detalle |
|---|---|
| Requerimiento | RF-05 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | Nombre con espacios externos: " Generador de señales " |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | POST y GET devuelven nombre normalizado igual |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/equipment -> HTTP 201
2. GET /api/equipment -> HTTP 200
3. POST /api/auth/login -> HTTP 200
4. POST /api/auth/login -> HTTP 200
5. POST /api/auth/login -> HTTP 200

Inicial: Fallido. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-59.

Discrepancia inicial: POST devuelve espacios externos; GET devuelve nombre normalizado

### CP-60 · Rechazar solicitud

| Campo | Detalle |
|---|---|
| Requerimiento | RF-08 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución. |
| Datos de prueba | REQUESTED → REJECTED por administrador |
| Pasos | Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba. |
| Resultado esperado | HTTP 200 REJECTED |

Secuencia HTTP observada (después de preparar usuarios/sesiones):

1. POST /api/reservations -> HTTP 201
2. POST /api/reservations/a10710e5-d839-4e28-864c-4a72be5e0ea9/reject -> HTTP 200

Inicial: Aprobado. Regresión: Aprobado. Evidencia: qa/evidencias/funcionales.json, identificador CP-60.

### CP-61 · Carga de 50 usuarios en cloud

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-01 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | QA público HTTPS; cuenta estudiante; k6 instalado. |
| Datos de prueba | Rampa 1 min de 0 a 50, meseta 5 min, descenso 30 s; GET /equipment y /dashboard. |
| Pasos | Ejecutar qa/carga/reservalab.k6.js sobre QA y guardar el resumen. |
| Resultado esperado | p95 < 2 s por endpoint; errores < 1%; reportar promedio y solicitudes/segundo. |

Estado: Pendiente. Evidencia o ruta de ejecución: qa/carga/reservalab.k6.js (sin resultado cloud).

### CP-62 · Persistencia al reabrir la base

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-04 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Directorio temporal local, sin reutilizar datos del usuario. |
| Datos de prueba | Equipo PER-001 almacenado en PGlite. |
| Pasos | Insertar; cerrar conexión; reabrir mismo directorio; consultar registro. |
| Resultado esperado | Código, nombre y estado se conservan. |

Estado: Aprobado local. Evidencia o ruta de ejecución: qa/evidencias/persistencia.json.

### CP-63 · Flujo principal en escritorio y móvil

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-05 |
| Técnica / prioridad | Partición de equivalencia / Alta |
| Precondiciones | Chromium; datos demo; zona America/Guatemala. |
| Datos de prueba | 1440x1000 y 390x844. |
| Pasos | Iniciar sesión; solicitar equipo; aprobar; abrir historial; cambiar a vista móvil. |
| Resultado esperado | Sin error de JavaScript ni desplazamiento horizontal; controles visibles. |

Estado: Aprobado local. Evidencia o ruta de ejecución: qa/evidencias/navegador.json y capturas.

### CP-64 · Cobertura de módulos críticos

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-06 |
| Técnica / prioridad | Valores límite / Alta |
| Precondiciones | Node 24; npm ci; baseline-v0 conservado. |
| Datos de prueba | 90 pruebas; módulos domain.js y rules.js. |
| Pasos | npm run test:coverage; node scripts/check-coverage.mjs. |
| Resultado esperado | Al menos 30 pruebas; incremento >=20 puntos sobre línea base; cobertura de líneas >=80% en alcance. |

Estado: Aprobado local. Evidencia o ruta de ejecución: qa/evidencias/unitarias.json y coverage/coverage-summary.json.

### CP-65 · Publicación y acceso independiente

| Campo | Detalle |
|---|---|
| Requerimiento | RNF-08 |
| Técnica / prioridad | Transición de estados / Alta |
| Precondiciones | Repositorio remoto, backend, frontend y DB cloud creados. |
| Datos de prueba | URL real frontend y backend; ventana privada. |
| Pasos | Compilar; desplegar; abrir desde otra sesión; iniciar sesión con cuenta de prueba; crear reserva; reiniciar backend y volver a consultar. |
| Resultado esperado | Aplicación operativa por HTTPS; reserva conservada; enlaces accesibles al catedrático. |

Estado: Pendiente. Evidencia o ruta de ejecución: render.yaml y scripts/deploy-render.mjs (sin despliegue real).
