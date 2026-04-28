import { query } from '../database/db.js';

export const findUserByEmail = async (email) => {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
};

export const findUserById = async (id) => {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
};

export const createUser = async (name, email, passwordHash) => {
  const res = await query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [name, email, passwordHash]
  );
  return res.rows[0];
};

export const updateUser = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const res = await query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return res.rows[0];
};

export const verifyUser = async (id) => {
  const res = await query(
    'UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING *',
    [id]
  );
  return res.rows[0];
};
