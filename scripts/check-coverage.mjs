import { readFile } from "node:fs/promises";
const baseline = JSON.parse(
  await readFile("qa/evidencias/linea-base/coverage-summary.json", "utf8"),
);
const final = JSON.parse(
  await readFile("coverage/coverage-summary.json", "utf8"),
);
for (const file of ["backend/src/domain.js", "frontend/src/rules.js"]) {
  const a = Object.entries(baseline).find(([k]) =>
    k.replaceAll("\\", "/").endsWith(file),
  )?.[1];
  const b = Object.entries(final).find(([k]) =>
    k.replaceAll("\\", "/").endsWith(file),
  )?.[1];
  if (!a || !b) throw new Error("Falta cobertura para " + file);
  const delta = b.lines.pct - a.lines.pct;
  console.log(
    file,
    "base=" + a.lines.pct + "%",
    "actual=" + b.lines.pct + "%",
    "incremento=" + delta + " pp",
  );
  if (delta < 20)
    throw new Error("Incremento inferior a 20 puntos porcentuales.");
}
