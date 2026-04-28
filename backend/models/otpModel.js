import { query } from '../database/db.js';

export const createOTP = async (userId, email, otpCode) => {
  await query('DELETE FROM otp_verification WHERE email = $1', [email]);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const res = await query(
    'INSERT INTO otp_verification (user_id, email, otp_code, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, email, otpCode, expiresAt]
  );
  return res.rows[0];
};

export const verifyOTP = async (email, otpCode) => {
  const res = await query(
    'SELECT * FROM otp_verification WHERE email = $1 AND otp_code = $2 AND is_verified = FALSE AND expires_at > NOW()',
    [email, otpCode]
  );
  if (res.rows[0]) {
    await query('UPDATE otp_verification SET is_verified = TRUE WHERE id = $1', [res.rows[0].id]);
  }
  return res.rows[0];
};

export const incrementAttempts = async (email) => {
  await query(
    'UPDATE otp_verification SET attempts = attempts + 1 WHERE email = $1',
    [email]
  );
};
