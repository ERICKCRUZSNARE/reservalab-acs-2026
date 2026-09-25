import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import { createServer } from "vite";
import { createApp } from "../backend/src/app.js";
import { connectDatabase, initialize } from "../backend/src/db.js";
import { mkdir, writeFile } from "node:fs/promises";
import { once } from "node:events";
const db = await connectDatabase({ url: "", directory: ":memory:" });
await initialize(db, {
  demo: true,
  adminPassword: "AdminDemo2026!",
  studentPassword: "AlumnoDemo2026!",
});
const server = createApp(db).listen(3001, "127.0.0.1");
await once(server, "listening");
const vite = await createServer({
  root: "frontend",
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
});
await vite.listen();
const browser = await playwright.launch({
  args: chromium.args,
  executablePath:
    process.env.CHROMIUM_PATH || (await chromium.executablePath()),
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  timezoneId: "America/Guatemala",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("qa/evidencias/capturas", { recursive: true });
try {
  await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
  await page.screenshot({
    path: "qa/evidencias/capturas/01-login.png",
    fullPage: true,
  });
  await page.getByLabel("Correo electrónico").fill("admin@reservalab.test");
  await page.getByLabel("Contraseña", { exact: true }).fill("AdminDemo2026!");
  await page.getByRole("button", { name: "Entrar a ReservaLab" }).click();
  await page
    .getByRole("heading", { name: "Equipos para tu próxima práctica" })
    .waitFor();
  await page.getByRole("heading", { name: "Osciloscopio digital" }).waitFor();
  await page.screenshot({
    path: "qa/evidencias/capturas/02-catalogo-admin.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Solicitar reserva" }).first().click();
  await page
    .getByLabel("Propósito de la práctica")
    .fill("Práctica de circuitos digitales");
  await page
    .getByRole("button", { name: "Enviar solicitud", exact: true })
    .click();
  await page.getByRole("heading", { name: "Reservas y préstamos" }).waitFor();
  await page.getByText("Solicitada", { exact: true }).waitFor();
  await page.screenshot({
    path: "qa/evidencias/capturas/03-reserva-solicitada.png",
    fullPage: true,
  });
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Aprobar", exact: true }).click();
  await page.getByText("Aprobada", { exact: true }).waitFor();
  await page.screenshot({
    path: "qa/evidencias/capturas/04-reserva-aprobada.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Actividad", exact: true }).click();
  await page
    .getByRole("cell", { name: "RESERVATION_APPROVED", exact: true })
    .waitFor();
  await page.screenshot({
    path: "qa/evidencias/capturas/05-auditoria.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Equipos", exact: true }).click();
  await page.screenshot({
    path: "qa/evidencias/capturas/06-movil.png",
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  await writeFile(
    "qa/evidencias/navegador.json",
    JSON.stringify(
      {
        executedAt: new Date().toISOString(),
        browser: "Chromium headless",
        desktop: "1440x1000",
        mobile: "390x844",
        actions: [
          "login",
          "catálogo",
          "crear reserva",
          "aprobar reserva",
          "auditoría",
          "vista móvil",
        ],
        pageErrors: errors,
        mobileOverflow: overflow,
        result: errors.length || overflow ? "Fallido" : "Aprobado",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ errors, mobileOverflow: overflow }));
} finally {
  await browser.close();
  await vite.close();
  server.close();
  await db.close();
}
