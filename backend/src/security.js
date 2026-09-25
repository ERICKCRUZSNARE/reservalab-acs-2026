import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return salt + ":" + key.toString("hex");
}
export async function verifyPassword(password, stored) {
  if (typeof password !== "string" || password.length > 128) return false;
  const [salt, hex] = stored.split(":");
  const key = await scrypt(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}
export const tokenHash = (token) =>
  createHash("sha256").update(token).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");
