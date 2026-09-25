import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { hashPassword } from "./security.js";
export async function connectDatabase({
  url = process.env.DATABASE_URL,
  directory = process.env.DATA_DIR || "./.data",
} = {}) {
  if (url) {
    const pool = new pg.Pool({ connectionString: url, max: 10 });
    return {
      query: (...args) => pool.query(...args),
      close: () => pool.end(),
      transaction: async (fn) => {
        const c = await pool.connect();
        try {
          await c.query("BEGIN");
          const r = await fn(c);
          await c.query("COMMIT");
          return r;
        } catch (e) {
          await c.query("ROLLBACK");
          throw e;
        } finally {
          c.release();
        }
      },
    };
  }
  const db = new PGlite(directory === ":memory:" ? undefined : directory);
  await db.waitReady;
  return db;
}
export async function initialize(
  db,
  { demo = false, adminPassword, studentPassword } = {},
) {
  const schema = await readFile(
    new URL("./schema.sql", import.meta.url),
    "utf8",
  );
  await db.transaction(async (tx) => {
    for (const q of schema
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean))
      await tx.query(q);
  });
  if (!demo) return;
  if (!adminPassword || !studentPassword)
    throw new Error(
      "Configura ADMIN_PASSWORD y STUDENT_PASSWORD antes de crear datos de demostración.",
    );
  const users = [
    [
      "admin",
      "Administrador",
      process.env.ADMIN_EMAIL || "admin@reservalab.test",
      "ADMIN",
      adminPassword,
    ],
    [
      "student",
      "Estudiante demo",
      "alumno@reservalab.test",
      "STUDENT",
      studentPassword,
    ],
    [
      "other",
      "Otro estudiante",
      "otro@reservalab.test",
      "STUDENT",
      studentPassword,
    ],
  ];
  for (const [id, name, email, role, password] of users)
    await db.query(
      "INSERT INTO users VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",
      [id, name, email, await hashPassword(password), role],
    );
  const equipment = [
    [
      "eq-1",
      "LAB-001",
      "Osciloscopio digital",
      "Electrónica",
      "Dos canales, 100 MHz. Incluye sondas y cable de alimentación.",
      "AVAILABLE",
    ],
    [
      "eq-2",
      "LAB-002",
      "Kit de redes Cisco",
      "Redes",
      "Switch administrable, router y cables de consola.",
      "AVAILABLE",
    ],
    [
      "eq-3",
      "LAB-003",
      "Multímetro de precisión",
      "Medición",
      "Medición de voltaje, corriente y resistencia.",
      "AVAILABLE",
    ],
    [
      "eq-4",
      "LAB-004",
      "Analizador de fibra óptica",
      "Telecomunicaciones",
      "OTDR con adaptadores SC/APC y bobina de lanzamiento.",
      "MAINTENANCE",
    ],
  ];
  for (const row of equipment)
    await db.query(
      "INSERT INTO equipment VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING",
      row,
    );
}
export async function audit(tx, user, action, entity, now) {
  await tx.query("INSERT INTO audit VALUES ($1,$2,$3,$4,$5)", [
    randomUUID(),
    user.id,
    action,
    entity,
    now,
  ]);
}
