# Guía de inicio y cierre de entrega

Instalación en Windows, archivos incluidos y pasos que requieren intervención de Erick.

Paquete técnico preparado; la entrega académica aún requiere componentes externos y personales.

## 1. Qué está listo

ReservaLab es un producto funcional generado para evaluar su calidad. El estudiante conserva la responsabilidad de revisar el trabajo, ejecutar las herramientas en sus cuentas y defender los resultados. La aplicación está separada en frontend y backend y contiene reglas de negocio suficientes para aplicar las cuatro técnicas exigidas.

| Verificación | Resultado local |
|---|---|
| Compilación | Backend y frontend completados |
| Unitarias | 90 aprobadas: 65 backend y 25 frontend |
| Casos funcionales HTTP | Inicial: 57/60. Regresión: 60/60 |
| Postman / Newman | 24 solicitudes y 85 aserciones aprobadas |
| Navegador | Flujo principal, escritorio 1440 px y móvil 390 px, sin error JavaScript ni overflow horizontal |
| Defectos | 3 funcionales cerrados; 7 fichas SCA separadas |
| Cobertura | 100% de líneas en cuatro archivos del alcance. No es cobertura global. |

## 2. Primer arranque en Windows

Instalar Node.js 24 LTS. Extraer el ZIP en una ruta corta, por ejemplo D:\ReservaLab. Abrir PowerShell dentro de la carpeta que contiene package.json. La primera instalación necesita conexión a internet.

```
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
npm run dev
```

Abrir http://localhost:5173. Mantener la consola abierta. El API debe responder en http://localhost:3001/api/health. Para próximos arranques, usar INICIAR.cmd o npm run dev.

| Rol | Correo | Contraseña local |
|---|---|---|
| Administrador | admin@reservalab.test | AdminDemo2026! |
| Estudiante | alumno@reservalab.test | AlumnoDemo2026! |
| Otro estudiante | otro@reservalab.test | AlumnoDemo2026! |

Son datos ficticios. Cambiar las claves en el despliegue cloud. Recargar la página requiere volver a iniciar sesión porque el token del frontend se mantiene en memoria; los registros se conservan en la base de datos.

### 3. Verificar el proyecto

```
npm run build
npm run test:coverage
node scripts/check-coverage.mjs
npm run test:api
npm run test:functional
node scripts/persistence.mjs
```

Las pruebas HTTP usan una base aislada en memoria y no alteran tus datos de trabajo. Las salidas JSON, XML y capturas se encuentran en qa/evidencias. El reporte visual de cobertura se abre desde coverage/index.html.

## 4. Archivos del paquete

| Ruta | Contenido |
|---|---|
| docs/pdf | Siete PDF con portada, índice y paginación; bitácoras compactas de media página. |
| docs/*.md | Texto editable de los documentos y declaración de IA. |
| backend / frontend | Código fuente y pruebas unitarias. |
| qa/casos-completos.json | 65 casos diseñados; fuente de la matriz. |
| qa/TestLink_Casos.xml | Casos listos para importar en una instancia TestLink. |
| qa/api | Colección Postman y ambiente local. |
| qa/carga | Escenario k6 preparado para cloud. |
| qa/evidencias | Ejecuciones locales y capturas reales. |
| .github/workflows/quality.yml | Pipeline preparado, no ejecutado en una cuenta GitHub. |
| render.yaml | Plantilla cloud para un ambiente QA. |
| ReservaLab_historial.bundle | Historial Git exportado; conserva línea base y correcciones. |

## 5. Pendientes obligatorios

| Pendiente | Acción |
|---|---|
| Registro de aplicación | Presentar ReservaLab, repositorio, licencia y línea base. El plazo original de registro ya pasó; consultar al catedrático. |
| Trabajo individual | Confirmar la adaptación de E9: el texto exige revisión de PR por otro integrante. No se puede autoacreditar esa revisión. |
| Repositorio remoto | Conectar/crear GitHub, subir el historial real y dar acceso al catedrático. |
| Herramienta de pruebas | Importar casos y registrar ejecuciones/defectos en TestLink u otra herramienta admitida. Adjuntar evidencias. |
| Diez defectos de E5 | Hay tres funcionales y siete SCA de tooling. Confirmar admisión de SCA; si no, completar exploración con siete defectos funcionales genuinos. |
| Cloud | Crear PostgreSQL persistente, API y frontend. Verificar URL desde sesión independiente. |
| SonarQube | Ejecutar en el servidor local de Erick; exportar estado inicial/final; corregir Blocker/Critical y aprobar Quality Gate o justificar plan. |
| CI y PR | Registrar runner, secretos/variables, protección de ramas y revisiones efectivas; conservar enlaces y logs. |
| Carga cloud | Ejecutar k6 con 50 VU sostenidos cinco minutos y completar resultados/conclusión. |
| Defensa y bitácoras | Grabar personalmente los dos videos, publicarlos en YouTube y completar reflexiones auténticas. |

## 6. Orden para terminar la fase 1

• Arrancar ReservaLab localmente y practicar el flujo estudiante-administrador.

• Confirmar con el catedrático el trabajo individual y el registro tardío.

• Subir Git al repositorio remoto y completar los enlaces del registro.

• Crear el despliegue público persistente; verificarlo desde otra sesión.

• Importar casos en la herramienta elegida y registrar la ejecución y los hallazgos.

• Resolver el requisito de diez defectos, completar bitácora y grabar video de máximo diez minutos.

• Actualizar portada/enlaces/estado del informe y comprimir los documentos finales para el curso.

Fase 1: viernes 25 de septiembre de 2026, 23:59. Fase 2: viernes 30 de octubre de 2026, 23:59. El enunciado menciona el registro el 11 de septiembre en la sección 2.4 y el 12 en el cronograma; la discrepancia debe consultarse, sin atribuir retroactivamente un registro que no ocurrió.
