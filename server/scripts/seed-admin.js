import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import mysql from "mysql2/promise";
import { hashPassword } from "../src/utils/security.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const envPath = path.join(rootDir, ".env");

const loadEnvFile = () => {
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadEnvFile();

const prompt = async (label) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return await rl.question(label);
  } finally {
    rl.close();
  }
};

const pickValue = async (envKey, label, isPassword = false) => {
  const existing = process.env[envKey];
  if (existing) return existing;
  return prompt(label);
};

const main = async () => {
  const email = (await pickValue("ADMIN_EMAIL", "Admin email: ")).trim().toLowerCase();
  const password = await pickValue("ADMIN_PASSWORD", "Admin password: ");

  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    throw new Error("Missing database settings. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in .env.");
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  });

  try {
    await connection.execute(
      `CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      )`,
    );

    const passwordHash = hashPassword(password);
    await connection.execute(
      `INSERT INTO admins (email, password_hash)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [email, passwordHash],
    );

    console.log(`Admin ready: ${email}`);
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
