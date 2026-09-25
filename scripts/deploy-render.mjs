import { writeFile, mkdir } from "node:fs/promises";
const {
  RENDER_API_KEY: key,
  RENDER_BACKEND_ID: backend,
  RENDER_FRONTEND_ID: frontend,
  DEPLOY_COMMIT: commit,
} = process.env;
if (!key || !backend || !frontend || !commit)
  throw new Error(
    "Configura RENDER_API_KEY, los dos IDs de servicio y DEPLOY_COMMIT.",
  );
if (!/^[a-f0-9]{40}$/.test(commit))
  throw new Error("DEPLOY_COMMIT debe ser un SHA completo.");
const evidence = [];
async function request(path, body) {
  const r = await fetch("https://api.render.com/v1" + path, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + key,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!r.ok) throw new Error("Render HTTP " + r.status);
  return r.json();
}
for (const service of [backend, frontend]) {
  const deploy = await request("/services/" + service + "/deploys", {
    commitId: commit,
  });
  if (!deploy.id) throw new Error("Render no devolvió ID de despliegue.");
  const deadline = Date.now() + 15 * 60 * 1000;
  let finished = false;
  while (Date.now() < deadline) {
    const status = await request(`/services/${service}/deploys/${deploy.id}`);
    console.log(service, status.status);
    if (status.status === "live") {
      evidence.push({
        service,
        deployId: deploy.id,
        status: status.status,
        commit,
        at: new Date().toISOString(),
      });
      finished = true;
      break;
    }
    if (
      [
        "build_failed",
        "update_failed",
        "pre_deploy_failed",
        "canceled",
        "deactivated",
      ].includes(status.status)
    )
      throw new Error("Despliegue falló: " + status.status);
    await new Promise((r) => setTimeout(r, 10000));
  }
  if (!finished) throw new Error("Tiempo agotado esperando despliegue.");
}
await mkdir("qa/evidencias", { recursive: true });
await writeFile("qa/evidencias/deploy.json", JSON.stringify(evidence, null, 2));
