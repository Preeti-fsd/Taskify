import mysql from "mysql2/promise";
import { env } from "./env.js";

const sanitizeSqlValue = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeSqlValue(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeSqlValue(item)]),
    );
  }

  return value;
};

const sanitizeParams = (params) => sanitizeSqlValue(params);

export const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  connectionLimit: 10,
  namedPlaceholders: true,
  dateStrings: true,

  ssl:
    env.dbHost && env.dbHost.includes("aivencloud.com")
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, sanitizeParams(params));
  return rows;
};

export const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, sanitizeParams(params));
  return result;
};
