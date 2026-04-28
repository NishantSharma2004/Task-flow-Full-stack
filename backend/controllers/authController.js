import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { findUserByEmail, createUser, findUserById, updateUser, verifyUser } from '../models/userModel.js';
import { createOTP, verifyOTP, incrementAttempts } from '../models/otpModel.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { query } from '../database/db.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser(name, email, passwordHash);

    const otp = generateOTP();
    await createOTP(user.id, email, otp);
    await sendOTPEmail(email, name, otp);

    res.status(201).json({ message: 'Registration successful! Check your email for OTP.', userId: user.id, email });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOTPHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const otpRecord = await verifyOTP(email, otp);
    if (!otpRecord) {
      await incrementAttempts(email);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await verifyUser(otpRecord.user_id);
    const user = await findUserById(otpRecord.user_id);
    const { accessToken, refreshToken } = generateTokens(user.id);

    res.json({ message: 'Email verified!', accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    await createOTP(user.id, email, otp);
    await sendOTPEmail(email, user.name, otp);

    res.json({ message: 'OTP resent successfully!' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.is_verified) return res.status(403).json({ message: 'Please verify your email first', needsVerification: true, email });

    const { accessToken, refreshToken } = generateTokens(user.id);
    res.json({ message: 'Login successful!', accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, profile_image: user.profile_image } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await findUserById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'No account with this email' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query('DELETE FROM password_reset WHERE email = $1', [email]);
    await query('INSERT INTO password_reset (user_id, email, token, expires_at) VALUES ($1,$2,$3,$4)', [user.id, email, token, expiresAt]);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, user.name, resetLink);

    res.json({ message: 'Password reset link sent to your email!' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password required' });

    const res2 = await query('SELECT * FROM password_reset WHERE token = $1 AND is_used = FALSE AND expires_at > NOW()', [token]);
    const record = res2.rows[0];
    if (!record) return res.status(400).json({ message: 'Invalid or expired reset link' });

    const passwordHash = await bcrypt.hash(password, 12);
    await updateUser(record.user_id, { password_hash: passwordHash });
    await query('UPDATE password_reset SET is_used = TRUE WHERE id = $1', [record.id]);

    res.json({ message: 'Password reset successful! Please login.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, profile_image } = req.body;
    const updated = await updateUser(req.user.userId, { name, profile_image });
    const { password_hash, ...safeUser } = updated;
    res.json({ message: 'Profile updated!', user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await findUserById(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Current password is wrong' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await updateUser(req.user.userId, { password_hash: passwordHash });
    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
