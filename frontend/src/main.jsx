import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./api.js";
import {
  reservationErrors,
  visibleActions,
  countActive,
  filterEquipment,
  stateLabels,
  localInput,
} from "./rules.js";
import "./style.css";
const labels = {
  approve: "Aprobar",
  reject: "Rechazar",
  cancel: "Cancelar",
  checkout: "Entregar",
  return: "Registrar devolución",
};
const equipmentLabels = {
  AVAILABLE: "Disponible",
  MAINTENANCE: "Mantenimiento",
  RETIRED: "Retirado",
};
const fmt = (ms) =>
  new Date(Number(ms)).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
function Field({ label, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} aria-invalid={!!error} />
      {error && <small className="error">{error}</small>}
    </label>
  );
}
function App() {
  const [session, setSession] = useState(null),
    [tab, setTab] = useState("catalog"),
    [equipment, setEquipment] = useState([]),
    [reservations, setReservations] = useState([]),
    [audit, setAudit] = useState([]),
    [query, setQuery] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [selected, setSelected] = useState(null),
    [errors, setErrors] = useState({}),
    [register, setRegister] = useState(false);
  const [form, setForm] = useState({
    equipment_id: "",
    start: localInput(Date.now() + 3600000),
    end: localInput(Date.now() + 7200000),
    purpose: "",
  });
  const [login, setLogin] = useState({ email: "", password: "", name: "" });
  const [newEq, setNewEq] = useState({
    code: "",
    name: "",
    category: "",
    description: "",
  });
  const [adding, setAdding] = useState(false);
  const request = (path, options = {}) =>
    api(path, { ...options, token: session?.token });
  async function refresh() {
    setLoading(true);
    try {
      const [e, r] = await Promise.all([
        request("/equipment"),
        request("/reservations"),
      ]);
      setEquipment(e);
      setReservations(r);
      if (session.user.role === "ADMIN") setAudit(await request("/audit"));
    } catch (e) {
      setMessage(e.message);
      if (e.status === 401) setSession(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (session) refresh();
  }, [session]);
  async function signIn(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (register) {
        await api("/auth/register", { method: "POST", body: login });
        setRegister(false);
        setMessage("Cuenta creada. Ya puedes iniciar sesión.");
      } else {
        setSession(await api("/auth/login", { method: "POST", body: login }));
        setLogin({ ...login, password: "" });
      }
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function act(r, action) {
    if (!window.confirm(`${labels[action]} la reserva de ${r.equipment_name}?`))
      return;
    setBusy(true);
    setMessage("");
    try {
      await request(`/reservations/${r.id}/${action}`, {
        method: "POST",
        body: {},
      });
      setMessage("Reserva actualizada.");
      await refresh();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function saveReservation(e) {
    e.preventDefault();
    const errs = reservationErrors(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await request("/reservations", {
        method: "POST",
        body: {
          ...form,
          start: new Date(form.start).getTime(),
          end: new Date(form.end).getTime(),
        },
      });
      setSelected(null);
      setTab("reservations");
      setMessage("Solicitud enviada. Está pendiente de aprobación.");
      await refresh();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function saveEquipment(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await request("/equipment", { method: "POST", body: newEq });
      setAdding(false);
      setNewEq({ code: "", name: "", category: "", description: "" });
      setMessage("Equipo agregado.");
      await refresh();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function changeStatus(eq, status) {
    if (!window.confirm(`Cambiar ${eq.name} a ${equipmentLabels[status]}?`))
      return;
    setBusy(true);
    try {
      await request(`/equipment/${eq.id}/status`, {
        method: "PATCH",
        body: { status },
      });
      setMessage("Estado actualizado.");
      await refresh();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!session)
    return (
      <main className="login-page">
        <section className="brand-panel">
          <div className="brand">
            R<span>ReservaLab</span>
          </div>
          <div>
            <p className="eyebrow">LABORATORIOS · GESTIÓN DE EQUIPOS</p>
            <h1>
              El equipo correcto.
              <br />
              En el momento
              <br />
              <em>que lo necesitas.</em>
            </h1>
            <p>
              Consulta equipos, solicita una reserva y lleva el control de tus
              préstamos.
            </p>
          </div>
          <p className="brand-foot">
            Reservas claras. Laboratorios en movimiento.
          </p>
        </section>
        <section className="login-panel">
          <div className="login-card">
            <p className="eyebrow">BIENVENIDO A RESERVALAB</p>
            <h2>{register ? "Crea tu cuenta" : "Inicia sesión"}</h2>
            <p className="muted">
              {register
                ? "Tu cuenta tendrá el rol de estudiante."
                : "Ingresa para consultar equipos y gestionar reservas."}
            </p>
            <form onSubmit={signIn}>
              {register && (
                <Field
                  label="Nombre completo"
                  value={login.name}
                  onChange={(e) => setLogin({ ...login, name: e.target.value })}
                  required
                  minLength={2}
                  maxLength={80}
                />
              )}
              <Field
                label="Correo electrónico"
                type="email"
                autoComplete="username"
                value={login.email}
                onChange={(e) => setLogin({ ...login, email: e.target.value })}
                required
              />
              <Field
                label="Contraseña"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                value={login.password}
                onChange={(e) =>
                  setLogin({ ...login, password: e.target.value })
                }
                required
              />
              {register && (
                <p className="hint">
                  De 10 a 128 caracteres, con mayúscula, minúscula y número.
                </p>
              )}
              <button className="primary wide" disabled={busy}>
                {busy
                  ? "Procesando…"
                  : register
                    ? "Crear cuenta"
                    : "Entrar a ReservaLab"}
              </button>
            </form>
            {message && (
              <p role="status" className="notice">
                {message}
              </p>
            )}
            <button
              className="text-button"
              onClick={() => {
                setRegister(!register);
                setMessage("");
              }}
            >
              {register
                ? "Ya tengo una cuenta"
                : "Crear una cuenta de estudiante"}
            </button>
            <div className="demo-note">
              Ambiente académico. Utiliza únicamente datos de prueba.
            </div>
          </div>
        </section>
      </main>
    );
  const user = session.user;
  return (
    <div className="app">
      <aside>
        <div className="brand">
          R<span>ReservaLab</span>
        </div>
        <p className="nav-label">ESPACIO DE TRABAJO</p>
        <nav aria-label="Navegación principal">
          {[
            ["catalog", "Equipos"],
            ["reservations", "Reservas"],
            ...(user.role === "ADMIN" ? [["audit", "Actividad"]] : []),
          ].map(([id, name]) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              className={tab === id ? "active" : ""}
              onClick={() => {
                setTab(id);
                setSelected(null);
                setAdding(false);
                setMessage("");
              }}
            >
              {name}
            </button>
          ))}
        </nav>
        <div className="profile">
          <strong>{user.name}</strong>
          <span>{user.role === "ADMIN" ? "Administrador" : "Estudiante"}</span>
          <button
            onClick={async () => {
              try {
                await request("/auth/logout", { method: "POST" });
              } finally {
                setSession(null);
                setEquipment([]);
                setReservations([]);
                setMessage("");
              }
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header>
          <div>
            <p className="eyebrow">
              LABORATORIO /{" "}
              {tab === "catalog"
                ? "CATÁLOGO"
                : tab === "audit"
                  ? "ACTIVIDAD"
                  : "RESERVAS"}
            </p>
            <h1>
              {tab === "catalog"
                ? "Equipos para tu próxima práctica"
                : tab === "audit"
                  ? "Historial de actividad"
                  : "Reservas y préstamos"}
            </h1>
          </div>
          <button className="secondary" onClick={refresh} disabled={loading}>
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </header>
        <section className="stats" aria-label="Resumen">
          <div>
            <span>Equipos disponibles</span>
            <strong>
              {equipment.filter((e) => e.status === "AVAILABLE").length}
              <small> / {equipment.length}</small>
            </strong>
          </div>
          <div>
            <span>Solicitudes pendientes</span>
            <strong>
              {reservations
                .filter((r) => r.status === "REQUESTED")
                .length.toString()
                .padStart(2, "0")}
            </strong>
          </div>
          <div>
            <span>En préstamo</span>
            <strong>
              {reservations
                .filter((r) => r.status === "CHECKED_OUT")
                .length.toString()
                .padStart(2, "0")}
            </strong>
          </div>
        </section>
        {message && (
          <div className="notice" role="status">
            {message}
            <button aria-label="Cerrar mensaje" onClick={() => setMessage("")}>
              ×
            </button>
          </div>
        )}
        {tab === "catalog" && (
          <>
            <div className="toolbar">
              <label className="search">
                <span>Buscar equipo</span>
                <input
                  placeholder="Nombre, código o categoría"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {user.role === "ADMIN" && (
                <button
                  className="primary"
                  onClick={() => {
                    setAdding(!adding);
                    setSelected(null);
                  }}
                >
                  + Agregar equipo
                </button>
              )}
            </div>
            {adding && (
              <section className="form-panel">
                <h2>Nuevo equipo</h2>
                <form onSubmit={saveEquipment} className="form-grid">
                  {Object.entries({
                    code: "Código",
                    name: "Nombre",
                    category: "Categoría",
                    description: "Descripción",
                  }).map(([key, label]) => (
                    <Field
                      key={key}
                      label={label}
                      value={newEq[key]}
                      required
                      onChange={(e) =>
                        setNewEq({ ...newEq, [key]: e.target.value })
                      }
                    />
                  ))}
                  <div className="form-actions">
                    <button className="primary" disabled={busy}>
                      Guardar equipo
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setAdding(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </form>
              </section>
            )}
            {selected && (
              <section className="form-panel">
                <div className="section-head">
                  <h2>Reservar {selected.name}</h2>
                  <button
                    className="text-button"
                    onClick={() => setSelected(null)}
                  >
                    Cerrar
                  </button>
                </div>
                <p className="muted">
                  De 1 a 8 horas · Hasta 30 días de anticipación · Máximo 3
                  reservas activas
                </p>
                <form onSubmit={saveReservation} className="form-grid">
                  <Field
                    label="Fecha y hora de inicio"
                    type="datetime-local"
                    value={form.start}
                    error={errors.start}
                    onChange={(e) =>
                      setForm({ ...form, start: e.target.value })
                    }
                  />
                  <Field
                    label="Fecha y hora de fin"
                    type="datetime-local"
                    value={form.end}
                    error={errors.end}
                    onChange={(e) => setForm({ ...form, end: e.target.value })}
                  />
                  <label className="field full">
                    <span>Propósito de la práctica</span>
                    <textarea
                      value={form.purpose}
                      maxLength={300}
                      onChange={(e) =>
                        setForm({ ...form, purpose: e.target.value })
                      }
                      aria-invalid={!!errors.purpose}
                    />
                    {errors.purpose && (
                      <small className="error">{errors.purpose}</small>
                    )}
                  </label>
                  <button className="primary" disabled={busy}>
                    Enviar solicitud
                  </button>
                </form>
              </section>
            )}
            <div className="equipment-grid">
              {filterEquipment(equipment, query).map((eq, i) => (
                <article className="equipment-card" key={eq.id}>
                  <div className="equipment-top">
                    <span className="equipment-number">{eq.code}</span>
                    <span className={"badge " + eq.status}>
                      {equipmentLabels[eq.status]}
                    </span>
                  </div>
                  <div className="equipment-type">{eq.category}</div>
                  <h2>{eq.name}</h2>
                  <p>{eq.description}</p>
                  <div className="card-actions">
                    <button
                      className="primary"
                      disabled={eq.status !== "AVAILABLE" || busy}
                      onClick={() => {
                        setSelected(eq);
                        setAdding(false);
                        setErrors({});
                        setForm({ ...form, equipment_id: eq.id });
                        setMessage("");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Solicitar reserva
                    </button>
                    {user.role === "ADMIN" && (
                      <select
                        aria-label={"Estado de " + eq.name}
                        value={eq.status}
                        disabled={busy}
                        onChange={(e) => changeStatus(eq, e.target.value)}
                      >
                        {Object.entries(equipmentLabels).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {!loading && !filterEquipment(equipment, query).length && (
              <p className="empty">
                No se encontraron equipos para esta búsqueda.
              </p>
            )}
          </>
        )}
        {tab === "reservations" && (
          <>
            <div className="section-head">
              <p className="muted">
                {user.role === "ADMIN"
                  ? "Todas las solicitudes del laboratorio"
                  : `${countActive(reservations)} de 3 reservas activas`}
              </p>
              <span className="hint">
                Fechas en la zona horaria de tu dispositivo
              </span>
            </div>
            <div className="reservation-list">
              {reservations.map((r) => (
                <article className="reservation" key={r.id}>
                  <div>
                    <span className={"badge " + r.status}>
                      {stateLabels[r.status]}
                    </span>
                    <h2>{r.equipment_name}</h2>
                    <p className="muted">
                      {user.role === "ADMIN" ? r.user_name + " · " : ""}
                      {r.purpose}
                    </p>
                    <p className="date">
                      {fmt(r.start)} → {fmt(r.end)}
                    </p>
                    {r.status === "RETURNED" && (
                      <p>Retraso: {r.late_minutes} minutos</p>
                    )}
                    <small className="record-id">ID: {r.id}</small>
                  </div>
                  <div className="reservation-actions">
                    {visibleActions(r, user).map((action) => (
                      <button
                        disabled={busy}
                        key={action}
                        className={
                          ["cancel", "reject"].includes(action)
                            ? "secondary"
                            : "primary"
                        }
                        onClick={() => act(r, action)}
                      >
                        {labels[action]}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            {!loading && !reservations.length && (
              <div className="empty">
                <h2>Aún no hay reservas</h2>
                <p>
                  Elige un equipo del catálogo y envía tu primera solicitud.
                </p>
                <button className="primary" onClick={() => setTab("catalog")}>
                  Ver equipos
                </button>
              </div>
            )}
          </>
        )}
        {tab === "audit" && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td>{fmt(a.created_at)}</td>
                    <td>{a.user_name}</td>
                    <td>{a.action}</td>
                    <td>{a.entity_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!audit.length && (
              <p className="empty">
                Las operaciones del laboratorio aparecerán aquí.
              </p>
            )}
          </div>
        )}
        <footer>ReservaLab · Gestión de equipos de laboratorio</footer>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
