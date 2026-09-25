import { it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  newToken,
  tokenHash,
} from "../src/security.js";
it("hash scrypt verifica contraseña correcta", async () =>
  expect(
    await verifyPassword(
      "ClaveCorrecta2026!",
      await hashPassword("ClaveCorrecta2026!"),
    ),
  ).toBe(true));
it("contraseña errónea no autentica", async () =>
  expect(
    await verifyPassword(
      "ClaveIncorrecta2026!",
      await hashPassword("ClaveCorrecta2026!"),
    ),
  ).toBe(false));
it("salt único aun con contraseña igual", async () =>
  expect(await hashPassword("Clave2026!")).not.toBe(
    await hashPassword("Clave2026!"),
  ));
it("rechaza entrada no textual", async () =>
  expect(await verifyPassword(null, "x:y")).toBe(false));
it("rechaza contraseña demasiado larga", async () =>
  expect(await verifyPassword("a".repeat(129), "x:y")).toBe(false));
it("tokens aleatorios distintos de 256 bits", () => {
  const t = newToken();
  expect(t).toHaveLength(64);
  expect(newToken()).not.toBe(t);
  expect(tokenHash(t)).not.toBe(t);
});
