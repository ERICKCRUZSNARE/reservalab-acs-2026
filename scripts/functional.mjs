import { connectDatabase, initialize } from "../backend/src/db.js";
import { createApp } from "../backend/src/app.js";
import { writeFile, mkdir } from "node:fs/promises";
import { once } from "node:events";
import { execSync } from "node:child_process";
const H = 3600000,
  M = 60000,
  D = 24 * H;
const NOW = Math.ceil(Date.now() / M) * M;
let time = NOW,
  requests = [],
  results = [],
  catalog = [];
const db = await connectDatabase({ url: "", directory: ":memory:" });
await initialize(db, {
  demo: true,
  adminPassword: "AdminDemo2026!",
  studentPassword: "AlumnoDemo2026!",
});
const server = createApp(db, { clock: () => time }).listen(0, "127.0.0.1");
await once(server, "listening");
const url = "http://127.0.0.1:" + server.address().port;
async function call(path, { token, method = "GET", body, raw } = {}) {
  const started = performance.now();
  const response = await fetch(url + "/api" + path, {
    method,
    headers: {
      ...(body !== undefined || raw !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(raw !== undefined ? { body: raw } : {}),
  });
  const data = await response.json();
  const clean = { ...data };
  if (clean.token) clean.token = "[REDACTED]";
  requests.push({
    method,
    path,
    body: body
      ? Object.fromEntries(
          Object.entries(body).map(([k, v]) => [
            k,
            k === "password" ? "[REDACTED]" : v,
          ]),
        )
      : raw
        ? "[raw JSON]"
        : null,
    status: response.status,
    response: Array.isArray(data) ? data : clean,
    milliseconds: Math.round((performance.now() - started) * 100) / 100,
  });
  return { status: response.status, data };
}
const expect = (result, status, code) => {
  if (result.status !== status || (code && result.data.code !== code))
    throw new Error(
      `Esperado HTTP ${status}${code ? " / " + code : ""}; obtenido HTTP ${result.status} / ${result.data.code || result.data.status || "OK"}`,
    );
  return result.data;
};
let a, s, o;
async function reset() {
  time = NOW;
  await db.query("DELETE FROM audit");
  await db.query("DELETE FROM reservations");
  await db.query("DELETE FROM sessions");
  await db.query("DELETE FROM equipment WHERE id NOT LIKE 'eq-%'");
  await db.query("UPDATE equipment SET status='AVAILABLE'");
  await db.query("UPDATE equipment SET status='MAINTENANCE' WHERE id='eq-4'");
  await db.query(
    "DELETE FROM users WHERE id NOT IN ('admin','student','other')",
  );
  a = (
    await call("/auth/login", {
      method: "POST",
      body: { email: "admin@reservalab.test", password: "AdminDemo2026!" },
    })
  ).data.token;
  s = (
    await call("/auth/login", {
      method: "POST",
      body: { email: "alumno@reservalab.test", password: "AlumnoDemo2026!" },
    })
  ).data.token;
  o = (
    await call("/auth/login", {
      method: "POST",
      body: { email: "otro@reservalab.test", password: "AlumnoDemo2026!" },
    })
  ).data.token;
  requests = [];
}
const input = (extra = {}) => ({
  equipment_id: "eq-1",
  start: NOW + H,
  end: NOW + 2 * H,
  purpose: "Práctica de laboratorio",
  ...extra,
});
const reserve = (extra = {}, token = s) =>
  call("/reservations", { token, method: "POST", body: input(extra) });
const transition = (r, action, token = a) =>
  call(`/reservations/${r.id}/${action}`, { token, method: "POST", body: {} });
async function requested(extra = {}, token = s) {
  return expect(await reserve(extra, token), 201);
}
async function approved(extra = {}, token = s) {
  const r = await requested(extra, token);
  expect(await transition(r, "approve"), 200);
  return r;
}
async function test(
  id,
  rf,
  technique,
  title,
  data,
  expected,
  fn,
  priority = "Alta",
) {
  const meta = {
    id,
    requirement: rf,
    technique,
    title,
    preconditions:
      "Base de pruebas aislada; equipos LAB-001 a LAB-003 disponibles, LAB-004 en mantenimiento; usuarios administrador, estudiante y otro estudiante; reloj T definido por la ejecución.",
    data,
    steps:
      "Ejecutar las solicitudes registradas en la evidencia del caso, en el orden indicado. Los tokens se obtienen con las cuentas de prueba.",
    expected,
    priority,
  };
  catalog.push(meta);
  await reset();
  const start = new Date().toISOString();
  let outcome = "Aprobado",
    error = null;
  try {
    await fn();
  } catch (e) {
    outcome = "Fallido";
    error = e.message;
  }
  results.push({ ...meta, outcome, error, executed_at: start, requests });
  console.log(id, outcome, title, error || "");
}
try {
  await test(
    "CP-01",
    "RF-01",
    "Partición de equivalencia",
    "Registrar estudiante válido",
    "Nombre Erick; correo erick@example.test; clave Segura2026!",
    "HTTP 201; rol STUDENT",
    async () =>
      expect(
        await call("/auth/register", {
          method: "POST",
          body: {
            name: "Erick",
            email: "erick@example.test",
            password: "Segura2026!",
          },
        }),
        201,
      ),
  );
  await test(
    "CP-02",
    "RF-01",
    "Partición de equivalencia",
    "Rechazar correo duplicado",
    "alumno@reservalab.test",
    "HTTP 409 DUPLICATE",
    async () =>
      expect(
        await call("/auth/register", {
          method: "POST",
          body: {
            name: "Erick",
            email: "alumno@reservalab.test",
            password: "Segura2026!",
          },
        }),
        409,
        "DUPLICATE",
      ),
  );
  await test(
    "CP-03",
    "RF-01",
    "Partición de equivalencia",
    "Rechazar correo sin arroba",
    "correo=incorrecto",
    "HTTP 422 EMAIL",
    async () =>
      expect(
        await call("/auth/register", {
          method: "POST",
          body: { name: "Erick", email: "incorrecto", password: "Segura2026!" },
        }),
        422,
        "EMAIL",
      ),
  );
  await test(
    "CP-04",
    "RF-01",
    "Valores límite",
    "Contraseña de 9 caracteres",
    "Abcdefg12 (9 caracteres)",
    "HTTP 422 PASSWORD",
    async () =>
      expect(
        await call("/auth/register", {
          method: "POST",
          body: {
            name: "Erick",
            email: "erick@example.test",
            password: "Abcdefg12",
          },
        }),
        422,
        "PASSWORD",
      ),
  );
  await test(
    "CP-05",
    "RF-01",
    "Valores límite",
    "Contraseña de 10 caracteres",
    "Abcdefgh12 (10 caracteres)",
    "HTTP 201",
    async () =>
      expect(
        await call("/auth/register", {
          method: "POST",
          body: {
            name: "Erick",
            email: "erick@example.test",
            password: "Abcdefgh12",
          },
        }),
        201,
      ),
  );
  await test(
    "CP-06",
    "RF-02",
    "Tabla de decisión",
    "Credenciales válidas",
    "Correo existente y clave correcta",
    "HTTP 200; token emitido",
    async () => {
      const d = expect(
        await call("/auth/login", {
          method: "POST",
          body: {
            email: "alumno@reservalab.test",
            password: "AlumnoDemo2026!",
          },
        }),
        200,
      );
      if (!d.token) throw new Error("No se emitió token");
    },
  );
  await test(
    "CP-07",
    "RF-02",
    "Tabla de decisión",
    "Credenciales inválidas",
    "Correo existente y clave incorrecta",
    "HTTP 401 LOGIN",
    async () =>
      expect(
        await call("/auth/login", {
          method: "POST",
          body: {
            email: "alumno@reservalab.test",
            password: "Incorrecta2026!",
          },
        }),
        401,
        "LOGIN",
      ),
  );
  await test(
    "CP-08",
    "RF-03",
    "Tabla de decisión",
    "Recurso protegido sin sesión",
    "Sin Authorization",
    "HTTP 401 AUTH",
    async () => expect(await call("/equipment"), 401, "AUTH"),
  );
  await test(
    "CP-09",
    "RF-02",
    "Valores límite",
    "Sesión vencida a las 8 horas",
    "T=emisión+8 horas",
    "HTTP 401 AUTH",
    async () => {
      time = NOW + 8 * H;
      expect(await call("/auth/me", { token: s }), 401, "AUTH");
    },
  );
  await test(
    "CP-10",
    "RF-04",
    "Partición de equivalencia",
    "Consultar catálogo",
    "Usuario autenticado",
    "HTTP 200; cuatro equipos",
    async () => {
      const d = expect(await call("/equipment", { token: s }), 200);
      if (d.length !== 4) throw new Error("Catálogo incorrecto");
    },
  );
  const eq = {
    code: "LAB-009",
    name: "Generador de señales",
    category: "Electrónica",
    description: "Equipo para prácticas de señales",
  };
  await test(
    "CP-11",
    "RF-03",
    "Tabla de decisión",
    "Estudiante no crea equipos",
    "Rol STUDENT; equipo válido",
    "HTTP 403 FORBIDDEN",
    async () =>
      expect(
        await call("/equipment", { token: s, method: "POST", body: eq }),
        403,
        "FORBIDDEN",
      ),
  );
  await test(
    "CP-12",
    "RF-05",
    "Tabla de decisión",
    "Administrador crea equipo",
    "Rol ADMIN; código libre",
    "HTTP 201; equipo disponible",
    async () =>
      expect(
        await call("/equipment", { token: a, method: "POST", body: eq }),
        201,
      ),
  );
  await test(
    "CP-13",
    "RF-05",
    "Partición de equivalencia",
    "Código de equipo duplicado",
    "Código LAB-001 existente",
    "HTTP 409 DUPLICATE",
    async () =>
      expect(
        await call("/equipment", {
          token: a,
          method: "POST",
          body: { ...eq, code: "LAB-001" },
        }),
        409,
        "DUPLICATE",
      ),
  );
  await test(
    "CP-14",
    "RF-06",
    "Tabla de decisión",
    "Reserva de equipo en mantenimiento",
    "eq-4; horario válido",
    "HTTP 409 EQUIPMENT",
    async () =>
      expect(await reserve({ equipment_id: "eq-4" }), 409, "EQUIPMENT"),
  );
  for (const [id, length, status] of [
    ["CP-15", 9, 422],
    ["CP-16", 10, 201],
    ["CP-17", 300, 201],
    ["CP-18", 301, 422],
  ])
    await test(
      id,
      "RF-06",
      "Valores límite",
      `Propósito de ${length} caracteres`,
      `Propósito='a' repetido ${length} veces`,
      `HTTP ${status}`,
      async () =>
        expect(await reserve({ purpose: "a".repeat(length) }), status),
    );
  for (const [id, minutes, status] of [
    ["CP-19", 59, 422],
    ["CP-20", 60, 201],
    ["CP-21", 480, 201],
    ["CP-22", 481, 422],
  ])
    await test(
      id,
      "RF-06",
      "Valores límite",
      `Duración de ${minutes} minutos`,
      `Inicio=T+60 min; fin=inicio+${minutes} min`,
      `HTTP ${status}`,
      async () => expect(await reserve({ end: NOW + H + minutes * M }), status),
    );
  await test(
    "CP-23",
    "RF-06",
    "Valores límite",
    "Inicio igual al instante actual",
    "start=T",
    "HTTP 422 PAST",
    async () =>
      expect(await reserve({ start: NOW, end: NOW + H }), 422, "PAST"),
  );
  await test(
    "CP-24",
    "RF-06",
    "Valores límite",
    "Anticipación exacta de 30 días",
    "start=T+30 días",
    "HTTP 201",
    async () =>
      expect(
        await reserve({ start: NOW + 30 * D, end: NOW + 30 * D + H }),
        201,
      ),
  );
  await test(
    "CP-25",
    "RF-06",
    "Valores límite",
    "Anticipación superior a 30 días",
    "start=T+30 días+1 min",
    "HTTP 422 ADVANCE",
    async () =>
      expect(
        await reserve({ start: NOW + 30 * D + M, end: NOW + 30 * D + H + M }),
        422,
        "ADVANCE",
      ),
  );
  await test(
    "CP-26",
    "RF-07",
    "Valores límite",
    "Tres reservas activas permitidas",
    "Tres solicitudes futuras de un estudiante",
    "Tres HTTP 201",
    async () => {
      for (let i = 0; i < 3; i++)
        expect(
          await reserve({ start: NOW + (i + 1) * H, end: NOW + (i + 2) * H }),
          201,
        );
    },
  );
  await test(
    "CP-27",
    "RF-07",
    "Valores límite",
    "Cuarta reserva activa bloqueada",
    "Usuario con tres solicitudes",
    "HTTP 409 LIMIT",
    async () => {
      for (let i = 0; i < 3; i++)
        await requested({ start: NOW + (i + 1) * H, end: NOW + (i + 2) * H });
      expect(
        await reserve({ start: NOW + 4 * H, end: NOW + 5 * H }),
        409,
        "LIMIT",
      );
    },
  );
  await test(
    "CP-28",
    "RF-08",
    "Transición de estados",
    "Aprobar solicitud",
    "REQUESTED; administrador; equipo libre",
    "HTTP 200; APPROVED",
    async () => {
      const r = await requested();
      const d = expect(await transition(r, "approve"), 200);
      if (d.status !== "APPROVED") throw new Error("Estado incorrecto");
    },
  );
  await test(
    "CP-29",
    "RF-09",
    "Tabla de decisión",
    "Solapamiento con reserva aprobada",
    "A aprobada [T+1h,T+2h); B [T+90min,T+150min)",
    "HTTP 409 CONFLICT",
    async () => {
      await approved();
      expect(
        await reserve({ start: NOW + 90 * M, end: NOW + 150 * M }, o),
        409,
        "CONFLICT",
      );
    },
  );
  await test(
    "CP-30",
    "RF-09",
    "Valores límite",
    "Horarios contiguos permitidos",
    "A [T+1h,T+2h); B [T+2h,T+3h)",
    "HTTP 201",
    async () => {
      await approved();
      expect(await reserve({ start: NOW + 2 * H, end: NOW + 3 * H }, o), 201);
    },
  );
  await test(
    "CP-31",
    "RF-09",
    "Tabla de decisión",
    "Segunda aprobación sobre horario ocupado",
    "Dos pendientes mismo horario; aprobar A y luego B",
    "Primera 200; segunda 409 CONFLICT",
    async () => {
      const x = await requested(),
        y = await requested({}, o);
      expect(await transition(x, "approve"), 200);
      expect(await transition(y, "approve"), 409, "CONFLICT");
    },
  );
  await test(
    "CP-32",
    "RF-10",
    "Transición de estados",
    "Cancelar solicitud propia",
    "REQUESTED; usuario propietario",
    "HTTP 200 CANCELLED",
    async () => {
      const r = await requested();
      const d = expect(await transition(r, "cancel", s), 200);
      if (d.status !== "CANCELLED") throw new Error("Estado incorrecto");
    },
  );
  await test(
    "CP-33",
    "RF-03",
    "Tabla de decisión",
    "Cancelar solicitud ajena prohibido",
    "REQUESTED; otro estudiante",
    "HTTP 403 FORBIDDEN",
    async () =>
      expect(
        await transition(await requested(), "cancel", o),
        403,
        "FORBIDDEN",
      ),
  );
  await test(
    "CP-34",
    "RF-10",
    "Transición de estados",
    "Cancelar reserva aprobada",
    "APPROVED; antes del inicio",
    "HTTP 200 CANCELLED",
    async () => {
      const r = await approved();
      expect(await transition(r, "cancel", s), 200);
    },
  );
  await test(
    "CP-35",
    "RF-10",
    "Valores límite",
    "Cancelar al inicio prohibido",
    "APPROVED; T=start",
    "HTTP 409 STARTED",
    async () => {
      const r = await approved();
      time = Number(r.start);
      expect(await transition(r, "cancel", s), 409, "STARTED");
    },
  );
  await test(
    "CP-36",
    "RF-11",
    "Valores límite",
    "Entrega 15 minutos antes",
    "APPROVED; T=start-15 min",
    "HTTP 200 CHECKED_OUT",
    async () => {
      const r = await approved();
      time = Number(r.start) - 15 * M;
      const d = expect(await transition(r, "checkout"), 200);
      if (d.status !== "CHECKED_OUT") throw new Error("Estado incorrecto");
    },
  );
  await test(
    "CP-37",
    "RF-11",
    "Valores límite",
    "Entrega 16 minutos antes prohibida",
    "APPROVED; T=start-16 min",
    "HTTP 409 CHECKOUT_TIME",
    async () => {
      const r = await approved();
      time = Number(r.start) - 16 * M;
      expect(await transition(r, "checkout"), 409, "CHECKOUT_TIME");
    },
  );
  await test(
    "CP-38",
    "RF-12",
    "Transición de estados",
    "Devolución normal",
    "REQUESTED → APPROVED → CHECKED_OUT → RETURNED",
    "HTTP 200 RETURNED; retraso=0",
    async () => {
      const r = await approved();
      time = Number(r.start);
      expect(await transition(r, "checkout"), 200);
      const d = expect(await transition(r, "return"), 200);
      if (d.status !== "RETURNED" || d.late_minutes !== 0)
        throw new Error("Devolución incorrecta");
    },
  );
  await test(
    "CP-39",
    "RF-12",
    "Transición de estados",
    "No devolver una solicitud",
    "REQUESTED → RETURNED",
    "HTTP 409 STATE",
    async () =>
      expect(await transition(await requested(), "return"), 409, "STATE"),
  );
  await test(
    "CP-40",
    "RF-12",
    "Transición de estados",
    "No devolver dos veces",
    "RETURNED → RETURNED",
    "HTTP 409 STATE",
    async () => {
      const r = await approved();
      time = Number(r.start);
      await transition(r, "checkout");
      await transition(r, "return");
      expect(await transition(r, "return"), 409, "STATE");
    },
  );
  await test(
    "CP-41",
    "RF-12",
    "Valores límite",
    "Redondeo del retraso",
    "Devolución 61 segundos después del fin",
    "late_minutes=2",
    async () => {
      const r = await approved();
      time = Number(r.start);
      await transition(r, "checkout");
      time = Number(r.end) + 61000;
      const d = expect(await transition(r, "return"), 200);
      if (d.late_minutes !== 2) throw new Error("Retraso incorrecto");
    },
  );
  await test(
    "CP-42",
    "RF-05",
    "Tabla de decisión",
    "Mantenimiento con compromiso bloqueado",
    "Equipo con reserva APPROVED",
    "HTTP 409 COMMITTED",
    async () => {
      await approved();
      expect(
        await call("/equipment/eq-1/status", {
          token: a,
          method: "PATCH",
          body: { status: "MAINTENANCE" },
        }),
        409,
        "COMMITTED",
      );
    },
  );
  await test(
    "CP-43",
    "RF-05",
    "Transición de estados",
    "Activar mantenimiento sin compromisos",
    "AVAILABLE → MAINTENANCE",
    "HTTP 200 MAINTENANCE",
    async () =>
      expect(
        await call("/equipment/eq-1/status", {
          token: a,
          method: "PATCH",
          body: { status: "MAINTENANCE" },
        }),
        200,
      ),
  );
  await test(
    "CP-44",
    "RF-14",
    "Partición de equivalencia",
    "Auditar creación y aprobación",
    "Crear reserva y aprobarla",
    "Dos eventos con actor, entidad y fecha",
    async () => {
      await approved();
      const rows = expect(await call("/audit", { token: a }), 200);
      if (
        rows.length !== 2 ||
        !rows.every((r) => r.user_id && r.entity_id && r.created_at)
      )
        throw new Error("Auditoría incompleta");
    },
  );
  await test(
    "CP-45",
    "RF-03",
    "Tabla de decisión",
    "Privacidad de reservas",
    "Reserva de estudiante A; consulta B",
    "B no recibe reservas de A",
    async () => {
      await requested();
      const rows = expect(await call("/reservations", { token: o }), 200);
      if (rows.length !== 0) throw new Error("Fuga de reservas");
    },
  );
  await test(
    "CP-46",
    "RF-13",
    "Partición de equivalencia",
    "Resumen por estado",
    "Una reserva solicitada",
    "counts.REQUESTED=1; equipment=4",
    async () => {
      await requested();
      const d = expect(await call("/dashboard", { token: s }), 200);
      if (d.counts.REQUESTED !== 1 || d.equipment !== 4)
        throw new Error("Resumen incorrecto");
    },
  );
  await test(
    "CP-47",
    "RF-02",
    "Transición de estados",
    "Cerrar sesión revoca token",
    "Token válido → logout → consulta",
    "Logout 200; consulta 401",
    async () => {
      expect(await call("/auth/logout", { token: s, method: "POST" }), 200);
      expect(await call("/auth/me", { token: s }), 401);
    },
  );
  await test(
    "CP-48",
    "RNF-02",
    "Valores límite",
    "Bloqueo de intentos de acceso",
    "Diez intentos fallidos; undécimo intento",
    "Diez 401; undécimo 429",
    async () => {
      for (let i = 0; i < 10; i++)
        expect(
          await call("/auth/login", {
            method: "POST",
            body: {
              email: "inexistente@example.test",
              password: "Incorrecta2026!",
            },
          }),
          401,
        );
      expect(
        await call("/auth/login", {
          method: "POST",
          body: {
            email: "inexistente@example.test",
            password: "Incorrecta2026!",
          },
        }),
        429,
      );
    },
  );
  await test(
    "CP-49",
    "RNF-03",
    "Tabla de decisión",
    "Aprobación simultánea consistente",
    "Dos pendientes mismo equipo y horario; aprobar concurrentemente",
    "Exactamente una 200 y una 409",
    async () => {
      const x = await requested(),
        y = await requested({}, o);
      const out = await Promise.all([
        transition(x, "approve"),
        transition(y, "approve"),
      ]);
      if (
        out.filter((x) => x.status === 200).length !== 1 ||
        out.filter((x) => x.status === 409).length !== 1
      )
        throw new Error("Doble aprobación: " + out.map((x) => x.status));
    },
  );
  await test(
    "CP-50",
    "RNF-07",
    "Partición de equivalencia",
    "Login sin cuerpo manejado",
    "POST /auth/login sin Content-Type ni cuerpo",
    "HTTP 400 BODY; nunca 500",
    async () =>
      expect(await call("/auth/login", { method: "POST" }), 400, "BODY"),
  );
  await test(
    "CP-51",
    "RF-11",
    "Tabla de decisión",
    "No entregar equipo con préstamo sin devolver",
    "A [T+1h,T+2h) prestada y vencida; B [T+2h,T+3h) aprobada; entregar B",
    "HTTP 409 OUTSTANDING_LOAN",
    async () => {
      const x = await approved(),
        y = await approved({ start: NOW + 2 * H, end: NOW + 3 * H }, o);
      time = NOW + H;
      expect(await transition(x, "checkout"), 200);
      time = NOW + 2 * H;
      expect(await transition(y, "checkout"), 409, "OUTSTANDING_LOAN");
    },
  );
  await test(
    "CP-52",
    "RNF-03",
    "Tabla de decisión",
    "Límite de reservas con concurrencia",
    "Cuatro creaciones simultáneas del mismo usuario",
    "Tres 201 y una 409",
    async () => {
      const out = await Promise.all(
        [0, 1, 2, 3].map((i) =>
          reserve({ start: NOW + (i + 1) * H, end: NOW + (i + 2) * H }),
        ),
      );
      if (
        out.filter((x) => x.status === 201).length !== 3 ||
        out.filter((x) => x.status === 409).length !== 1
      )
        throw new Error("Límite inconsistente");
    },
  );
  await test(
    "CP-53",
    "RNF-07",
    "Partición de equivalencia",
    "JSON mal formado manejado",
    "POST /auth/login; cuerpo {invalido",
    "HTTP 400 JSON",
    async () =>
      expect(
        await call("/auth/login", { method: "POST", raw: "{invalido" }),
        400,
        "JSON",
      ),
  );
  await test(
    "CP-54",
    "RNF-07",
    "Valores límite",
    "Límite de tamaño del cuerpo",
    "JSON con más de 16 KiB",
    "HTTP 413 SIZE",
    async () =>
      expect(
        await call("/auth/login", {
          method: "POST",
          body: { email: "x".repeat(18000) },
        }),
        413,
        "SIZE",
      ),
  );
  await test(
    "CP-55",
    "RF-06",
    "Partición de equivalencia",
    "Equipo inexistente",
    "equipment_id=no-existe",
    "HTTP 404 NOT_FOUND",
    async () =>
      expect(await reserve({ equipment_id: "no-existe" }), 404, "NOT_FOUND"),
  );
  await test(
    "CP-56",
    "RNF-05",
    "Partición de equivalencia",
    "Datos con tildes conservados",
    "Propósito=Medición de tensión y señal óptica",
    "Mismo propósito recuperado",
    async () => {
      const text = "Medición de tensión y señal óptica";
      const r = await requested({ purpose: text });
      const rows = expect(await call("/reservations", { token: s }), 200);
      if (rows.find((x) => x.id === r.id).purpose !== text)
        throw new Error("Codificación alterada");
    },
  );
  await test(
    "CP-57",
    "RNF-02",
    "Tabla de decisión",
    "No exponer hash de contraseña",
    "GET /auth/me",
    "Respuesta sin password ni password_hash",
    async () => {
      const d = expect(await call("/auth/me", { token: s }), 200);
      if ("password_hash" in d || "password" in d)
        throw new Error("Se expone credencial");
    },
  );
  await test(
    "CP-58",
    "RF-03",
    "Tabla de decisión",
    "Registro no permite escalar privilegios",
    "Registro con role=ADMIN",
    "Cuenta creada con STUDENT",
    async () => {
      const d = expect(
        await call("/auth/register", {
          method: "POST",
          body: {
            name: "Erick",
            email: "nuevo@example.test",
            password: "Segura2026!",
            role: "ADMIN",
          },
        }),
        201,
      );
      if (d.role !== "STUDENT") throw new Error("Escalada de privilegios");
    },
  );
  await test(
    "CP-59",
    "RF-05",
    "Partición de equivalencia",
    "Respuesta de creación consistente con consulta",
    'Nombre con espacios externos: " Generador de señales "',
    "POST y GET devuelven nombre normalizado igual",
    async () => {
      const d = expect(
        await call("/equipment", {
          token: a,
          method: "POST",
          body: { ...eq, name: " Generador de señales " },
        }),
        201,
      );
      const rows = expect(await call("/equipment", { token: a }), 200);
      if (d.name !== rows.find((e) => e.id === d.id).name)
        throw new Error(
          "POST devuelve espacios externos; GET devuelve nombre normalizado",
        );
    },
  );
  await test(
    "CP-60",
    "RF-08",
    "Transición de estados",
    "Rechazar solicitud",
    "REQUESTED → REJECTED por administrador",
    "HTTP 200 REJECTED",
    async () => {
      const d = expect(await transition(await requested(), "reject"), 200);
      if (d.status !== "REJECTED") throw new Error("Estado incorrecto");
    },
  );
} finally {
  let commit = "sin-commit";
  try {
    commit = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {}
  const suffix = process.argv.includes("--baseline") ? "-inicial" : "";
  await mkdir("qa/evidencias", { recursive: true });
  await writeFile(
    `qa/evidencias/funcionales${suffix}.json`,
    JSON.stringify(
      {
        application: "ReservaLab",
        commit,
        executedAt: new Date().toISOString(),
        environment:
          "LOCAL: PGlite en memoria; reloj inyectado; HTTP real; no cloud ni Test Plans",
        now: NOW,
        summary: {
          total: results.length,
          passed: results.filter((r) => r.outcome === "Aprobado").length,
          failed: results.filter((r) => r.outcome === "Fallido").length,
        },
        results,
      },
      null,
      2,
    ),
  );
  await writeFile("qa/casos.json", JSON.stringify(catalog, null, 2));
  server.close();
  await db.close();
}
console.log(
  JSON.stringify({
    total: results.length,
    passed: results.filter((r) => r.outcome === "Aprobado").length,
    failed: results.filter((r) => r.outcome === "Fallido").length,
  }),
);
process.exitCode = results.some((r) => r.outcome === "Fallido") ? 1 : 0;
