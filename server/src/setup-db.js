import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const dir = path.dirname(fileURLToPath(import.meta.url));
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', multipleStatements: true
});
try {
  await connection.query(await fs.readFile(path.join(dir, '../sql/schema.sql'), 'utf8'));
  await connection.query(await fs.readFile(path.join(dir, '../sql/seed.sql'), 'utf8'));
  console.log('Database schema and fictional sample data are ready.');
} finally { await connection.end(); }
