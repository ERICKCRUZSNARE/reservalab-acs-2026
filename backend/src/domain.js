export class RuleError extends Error {
  constructor(code, message, status = 422) { super(message); this.code = code; this.status = status; }
}
export const HOUR = 3600000;
export const DAY = 24 * HOUR;
export const ACTIVE = ['REQUESTED', 'APPROVED', 'CHECKED_OUT'];
export function requireRule(condition, code, message, status = 422) {
  if (!condition) throw new RuleError(code, message, status);
}
export function validateRegistration({name, email, password}) {
  requireRule(typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 80, 'NAME', 'El nombre debe tener entre 2 y 80 caracteres.');
  requireRule(typeof email === 'string' && email.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'EMAIL', 'Ingresa un correo válido.');
  requireRule(typeof password === 'string' && password.length >= 10 && password.length <= 128 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password), 'PASSWORD', 'La contraseña debe tener de 10 a 128 caracteres, mayúscula, minúscula y número.');
  return {name: name.trim(), email: email.trim().toLowerCase(), password};
}
export function validateReservation(data, now = Date.now()) {
  const start = Number(data.start), end = Number(data.end);
  requireRule(Number.isSafeInteger(start) && Number.isSafeInteger(end), 'DATES', 'Indica fechas válidas.');
  requireRule(start > now, 'PAST', 'La reserva debe comenzar en el futuro.');
  requireRule(start <= now + 30 * DAY, 'ADVANCE', 'La anticipación máxima es de 30 días.');
  requireRule(start % 60000 === 0 && end % 60000 === 0, 'PRECISION', 'Usa fechas con precisión de minutos.');
  requireRule(end - start >= HOUR && end - start <= 8 * HOUR, 'DURATION', 'La duración debe estar entre 1 y 8 horas.');
  requireRule(typeof data.purpose === 'string' && data.purpose.trim().length >= 10 && data.purpose.trim().length <= 300, 'PURPOSE', 'Describe el propósito en 10 a 300 caracteres.');
  return {...data, start, end, purpose: data.purpose.trim()};
}
export function overlaps(a, b) { return Number(a.start) < Number(b.end) && Number(b.start) < Number(a.end); }
export function canTransition(reservation, action, actor, now = Date.now()) {
  const admin = actor.role === 'ADMIN';
  const owner = actor.id === reservation.user_id;
  const states = {approve:['REQUESTED','APPROVED'],reject:['REQUESTED','REJECTED'],checkout:['APPROVED','CHECKED_OUT'],return:['CHECKED_OUT','RETURNED'],cancel:['REQUESTED','CANCELLED']};
  requireRule(Object.hasOwn(states, action), 'ACTION', 'Acción desconocida.', 400);
  requireRule(action === 'cancel' ? owner || admin : admin, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.', 403);
  const [from,to] = states[action];
  requireRule(reservation.status === from || (action === 'cancel' && reservation.status === 'APPROVED'), 'STATE', 'La transición no está permitida desde el estado actual.', 409);
  if (action === 'approve' || action === 'cancel') requireRule(Number(reservation.start) > now, 'STARTED', 'La reserva ya comenzó.', 409);
  if (action === 'checkout') requireRule(now >= Number(reservation.start) - 15 * 60000 && now < Number(reservation.end), 'CHECKOUT_TIME', 'La entrega se habilita 15 minutos antes del inicio y hasta antes del fin.', 409);
  return to;
}
export function lateMinutes(end, returned) { return Math.max(0, Math.ceil((returned - end) / 60000)); }
export async function authorizeApproval(repo, reservation, now) {
  const equipment = await repo.equipment(reservation.equipment_id);
  requireRule(equipment?.status === 'AVAILABLE', 'EQUIPMENT', 'El equipo no está disponible.', 409);
  requireRule(Number(reservation.start) > now, 'STARTED', 'La reserva ya comenzó.', 409);
  const conflicts = await repo.conflicts(reservation);
  requireRule(conflicts.length === 0, 'CONFLICT', 'Ya existe una reserva aprobada para ese horario.', 409);
  return true;
}
