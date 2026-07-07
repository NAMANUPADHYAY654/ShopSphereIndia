const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const generateOtpCode = () => crypto.randomInt(100000, 1000000).toString();

const hashOtpCode = async (otpCode) => bcrypt.hash(otpCode, 10);

const buildOtpMessage = ({ name, purpose, otpCode }) => {
  const action = purpose === 'register' ? 'verify your new ShopSphere account' : 'sign in to your ShopSphere account';

  return {
    subject: `ShopSphere India OTP: ${otpCode}`,
    text: `Hi ${name || 'there'},\n\nUse this OTP to ${action}: ${otpCode}\n\nThis code expires in 10 minutes. If you did not request it, you can ignore this message.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2 style="margin:0 0 12px">ShopSphere India verification code</h2>
        <p style="margin:0 0 12px">Hi ${name || 'there'},</p>
        <p style="margin:0 0 12px">Use this OTP to ${action}:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px;padding:16px 20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;display:inline-block">${otpCode}</div>
        <p style="margin:16px 0 0;color:#6b7280">This code expires in 10 minutes.</p>
      </div>
    `,
  };
};

const deliverOtp = async ({ channel, destination, otpCode, name, purpose }) => {
  if (channel === 'phone') {
    const hasTwilioConfig = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER;

    if (hasTwilioConfig) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `ShopSphere India OTP: ${otpCode}. Expires in 10 minutes.`,
        from: process.env.TWILIO_FROM_NUMBER,
        to: destination,
      });

      return { deliveryMethod: 'sms' };
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMS delivery is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.');
    }

    console.log(`[OTP][phone] ${destination}: ${otpCode}`);
    return { deliveryMethod: 'sms-dev' };
  }

  const hasEmailConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasEmailConfig) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = buildOtpMessage({ name, purpose, otpCode });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: destination,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    return { deliveryMethod: 'email' };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Email delivery is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  console.log(`[OTP][email] ${destination}: ${otpCode}`);
  return { deliveryMethod: 'email-dev' };
};

module.exports = {
  generateOtpCode,
  hashOtpCode,
  deliverOtp,
};