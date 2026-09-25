# Declaración de asistencia con inteligencia artificial

Estudiante: ERICK ESTUARDO CRUZ ROMERO. Carné: 0900-19-1362.
Herramienta: OpenAI ChatGPT / Codex, sesión iniciada a partir del enunciado ACS 2026.
Fecha de preparación: 25 de septiembre de 2026.

## Solicitudes del estudiante

1. «Hola haremos el siguiente proyecto, haz todo lo que piden y dame los archivos finales. Si tienes preguntas hazmelas para que todo el proyecto quede bien.»
2. «No e registrado ninguna aplicacion, asi que elijamos una que sea oportuna para nuestro proyecto o crearlo desde 0 con todo lo que piden.»
3. El estudiante indicó que trabaja solo, que no ha entregado avances, que dispone de SonarQube en localhost:9000 y que no tiene rúbrica adicional.

## Especificación empleada para generar el producto

Crear ReservaLab, aplicación web de reserva y préstamo de equipos de laboratorio. Separar React/Vite en frontend y Node/Express en backend. Base PostgreSQL y PGlite para ejecución local sin servidor de base de datos. Roles ADMIN y STUDENT. Permitir registro, sesión de ocho horas, catálogo, mantenimiento, reserva de 1 a 8 horas hasta 30 días de anticipación, máximo tres reservas activas, aprobación sin solapamientos, entrega desde 15 minutos antes del inicio, devolución con retraso en minutos, cancelación, rechazo, resumen e historial de operaciones. Bloquear entrega si el préstamo previo no fue devuelto. Datos de laboratorio ficticios y contraseñas de demostración solo para el entorno académico. Preparar documentación en español con identificadores estables, casos con cuatro técnicas, pruebas unitarias y API, scripts SonarQube/CI/CD/k6 y evidencias verificadas. Nunca completar con cifras, enlaces, videos o revisiones ficticias.

## Intervención de IA

La IA produjo el código inicial, la documentación, las pruebas, el material de preparación y los archivos de configuración; ejecutó pruebas locales y corrigió tres defectos reproducidos. El historial local identifica expresamente esa asistencia. No se atribuyen commits de IA a trabajo manual del estudiante.

## Responsabilidad y limitaciones

Erick debe revisar, ejecutar y comprender la entrega; declarar la asistencia; registrar sus propios cambios con su identidad real; producir su bitácora y su defensa. No se han realizado revisiones por otro integrante, grabación de video, registro en el curso, publicación en YouTube, despliegue externo ni ejecución contra el SonarQube de su equipo. Los archivos de esos componentes son preparación reproducible, no evidencia de ejecución externa.

## Línea base

Tag baseline-v0: aplicación sin pruebas unitarias. Reporte de instrumentación sin pruebas: 0% de líneas en backend/src/domain.js y frontend/src/rules.js. Conservar ese tag y reportes; no sustituirlos por una ejecución posterior. Los paquetes externos no se presentan como código original. La inclusión de pruebas generadas con IA debe declararse conforme a la sección 7.2 del enunciado.
