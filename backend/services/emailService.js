import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'TaskFlow - Your OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">TaskFlow</h2>
        <h3>Hello ${name}! 👋</h3>
        <p>Your OTP verification code is:</p>
        <div style="background: #6366f1; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px;">
          ${otp}
        </div>
        <p style="color: #666; margin-top: 20px;">⏰ This code expires in <strong>5 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, name, resetLink) => {
  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'TaskFlow - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">TaskFlow</h2>
        <h3>Hello ${name}! 👋</h3>
        <p>You requested to reset your password. Click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666;">⏰ This link expires in <strong>15 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

export const sendReminderEmail = async (email, name, taskTitle, dueDate) => {
  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `TaskFlow - Reminder: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">TaskFlow</h2>
        <h3>Hello ${name}! ⏰</h3>
        <p>Reminder for your task:</p>
        <div style="background: #fff; border-left: 4px solid #6366f1; padding: 15px; border-radius: 4px;">
          <strong>${taskTitle}</strong><br/>
          <span style="color: #666;">Due: ${dueDate}</span>
        </div>
        <p style="margin-top: 20px;">Stay productive! 💪</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};
