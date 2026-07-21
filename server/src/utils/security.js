import crypto from "node:crypto";
import { env } from "../config/env.js";

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

const base64UrlEncode = (value) =>
  Buffer.from(value).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

const base64UrlDecode = (value) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
};

export const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  if (!storedHash?.includes(":")) return false;
  const [salt, hash] = storedHash.split(":");
  const nextHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(nextHash, "hex"));
};

export const generateOtp = () => String(crypto.randomInt(100000, 999999));

export const hashValue = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

export const signToken = (payload, expiresInMs = 1000 * 60 * 60 * 24 * 7) => {
  const body = {
    ...payload,
    exp: Date.now() + expiresInMs,
  };
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(encodedBody)
    .digest("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  return `${encodedBody}.${signature}`;
};

export const verifyToken = (token) => {
  if (!token?.includes(".")) {
    throw new Error("Invalid token.");
  }

  const [encodedBody, signature] = token.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(encodedBody)
    .digest("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

  if (expectedSignature !== signature) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(base64UrlDecode(encodedBody));

  if (payload.exp && Date.now() > payload.exp) {
    throw new Error("Token expired.");
  }

  return payload;
};
