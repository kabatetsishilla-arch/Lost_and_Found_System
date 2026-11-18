import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const name = process.env.ADMIN_NAME?.trim();
const password = process.env.ADMIN_PASSWORD;
if (!email || !name || !password || password.length < 14) {
  console.error('Set ADMIN_EMAIL, ADMIN_NAME and an ADMIN_PASSWORD of at least 14 characters in server/.env.');
  process.exitCode = 1;
} else {
  try {
    const hash = await bcrypt.hash(password, 12);
    await pool.execute("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'admin') ON DUPLICATE KEY UPDATE name=VALUES(name),password_hash=VALUES(password_hash),role='admin'", [name,email,hash]);
    console.log(`Administrator account provisioned for ${email}. Keep its credentials private.`);
  } finally { await pool.end(); }
}
