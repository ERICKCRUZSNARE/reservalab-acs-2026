import { connectDatabase, initialize } from "../backend/src/db.js";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = await mkdtemp(join(tmpdir(), "reservalab-persistence-"));
try {
  let db = await connectDatabase({ url: "", directory: dir });
  await initialize(db);
  await db.query(
    "INSERT INTO equipment VALUES ('persist-1','PER-001','Equipo persistente','Pruebas','Verificar reinicio','AVAILABLE')",
  );
  await db.close();
  db = await connectDatabase({ url: "", directory: dir });
  const row = (await db.query("SELECT * FROM equipment WHERE id='persist-1'"))
    .rows[0];
  await db.close();
  if (row?.name !== "Equipo persistente")
    throw new Error("No persistió el registro");
  await writeFile(
    "qa/evidencias/persistencia.json",
    JSON.stringify(
      {
        case: "CP-62",
        environment:
          "LOCAL PGlite en directorio temporal; conexión cerrada y reabierta",
        executedAt: new Date().toISOString(),
        expected: "Registro conservado",
        actual: row,
        result: "Aprobado",
      },
      null,
      2,
    ),
  );
  console.log(
    "CP-62 Aprobado: datos conservados tras cerrar y reabrir la base.",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
