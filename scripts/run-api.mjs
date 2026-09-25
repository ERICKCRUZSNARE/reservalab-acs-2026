import newman from "newman";
import { connectDatabase, initialize } from "../backend/src/db.js";
import { createApp } from "../backend/src/app.js";
import { once } from "node:events";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const db = await connectDatabase({ url: "", directory: ":memory:" });
await initialize(db, {
  demo: true,
  adminPassword: "AdminDemo2026!",
  studentPassword: "AlumnoDemo2026!",
});
const server = createApp(db).listen(0, "127.0.0.1");
await once(server, "listening");
try {
  const collection = JSON.parse(
    await readFile("qa/api/ReservaLab.postman_collection.json", "utf8"),
  );
  await new Promise((resolve, reject) =>
    newman.run(
      {
        collection,
        envVar: [
          {
            key: "baseUrl",
            value: "http://127.0.0.1:" + server.address().port,
          },
        ],
        reporters: ["cli"],
        reporter: { cli: { noConsole: true } },
      },
      async (error, summary) => {
        if (error) return reject(error);
        const data = {
          executedAt: new Date().toISOString(),
          environment: "LOCAL aislado; HTTP real con PGlite",
          stats: summary.run.stats,
          failures: summary.run.failures.map((f) => ({
            source: f.source?.name,
            error: f.error?.message,
          })),
          executions: summary.run.executions.map((e) => ({
            request: e.item.name,
            status: e.response?.code,
            responseTime: e.response?.responseTime,
            assertions: e.assertions.map((a) => ({
              assertion: a.assertion,
              error: a.error?.message || null,
            })),
          })),
        };
        await mkdir("qa/evidencias", { recursive: true });
        await writeFile(
          "qa/evidencias/api-newman.json",
          JSON.stringify(data, null, 2),
        );
        if (summary.run.failures.length)
          reject(new Error(summary.run.failures.length + " fallos API"));
        else resolve();
      },
    ),
  );
} finally {
  server.close();
  await db.close();
}
