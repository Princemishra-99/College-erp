import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Otp } from '../models/Otp.js';

// ─── Generate a secure 6-digit OTP ────────────────────────────────────────────
export const generateOTP = () => {
  return String(crypto.randomInt(100000, 999999));
};

// ─── Email OTP Sending (Gmail SMTP / Dev Simulation) ───────────────────────────
export const sendEmailOTP = async (email, otp, purpose) => {
  // Save OTP to DB (delete existing OTP for same identifier+purpose first)
  await Otp.deleteMany({ identifier: email.toLowerCase(), purpose });
  await Otp.create({ identifier: email.toLowerCase(), otp, purpose });

  const purposeLabels = {
    registration: 'New Account Registration Verification',
    'reset-password': 'Password Reset Request',
    'change-password': 'Password Change Verification',
  };

  const subjectLabel = purposeLabels[purpose] || 'OTP Verification';

  const smtpUser = process.env.SMTP_EMAIL || process.env.SMTP_USER || 'researcherprince99@gmail.com';
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || 'wgkgjgclxfgpufxy';

  // ── DEV / DEMO SIMULATION (when no SMTP credentials are configured) ─────────
  if (!smtpUser || !smtpPass) {
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║          [DEV MODE] OTP SIMULATION               ║`);
    console.log(`║──────────────────────────────────────────────────║`);
    console.log(`║  Purpose : ${subjectLabel}`);
    console.log(`║  To      : ${email}`);
    console.log(`║  OTP CODE: ${otp}  ← Use this in the form!`);
    console.log(`║  Expires : 10 minutes from now`);
    console.log(`║  Note    : Add SMTP_EMAIL & SMTP_PASSWORD to send`);
    console.log(`║            real emails to inboxes.               ║`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);

    return {
      success: true,
      provider: 'dev-simulation',
      devOtp: otp,
      emailSent: false,
      message: `OTP generated! (Dev mode: OTP is displayed on screen)`,
    };
  }

  // ── REAL SMTP EMAIL SENDING (Gmail App Password / Custom SMTP) ───────────────
  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpService = process.env.SMTP_SERVICE || (smtpHost.includes('gmail') ? 'gmail' : undefined);

    const transportOptions = {
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    };

    if (smtpService) {
      transportOptions.service = smtpService;
    } else {
      transportOptions.host = smtpHost;
      transportOptions.port = smtpPort;
      transportOptions.secure = smtpPort === 465 || process.env.SMTP_SECURE === 'true';
    }

    const transporter = nodemailer.createTransport(transportOptions);

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0;">
      <div style="max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em;">🎓 College ERP System</h1>
          <p style="color: #c7d2fe; margin: 6px 0 0 0; font-size: 0.9rem;">AI-Integrated Campus Management Portal</p>
        </div>
        <!-- Body -->
        <div style="padding: 36px 32px;">
          <h2 style="color: #0f172a; font-size: 1.1rem; font-weight: 700; margin: 0 0 8px 0;">${subjectLabel}</h2>
          <p style="color: #475569; font-size: 0.92rem; line-height: 1.6; margin: 0 0 28px 0;">
            Your One-Time Password (OTP) for College ERP Portal is:
          </p>
          <!-- OTP Box -->
          <div style="background: linear-gradient(135deg, #eef2ff, #f5f3ff); border: 2px solid #c7d2fe; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 2.8rem; font-weight: 900; letter-spacing: 0.3em; color: #4f46e5; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="color: #7c3aed; font-size: 0.8rem; font-weight: 600; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">
              ⏱ Valid for 10 minutes only
            </p>
          </div>
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="color: #92400e; font-size: 0.82rem; margin: 0; line-height: 1.5;">
              ⚠️ <strong>Security Alert:</strong> Never share this OTP with anyone. The College ERP team will never ask for your OTP.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">
            If you did not request this OTP, please ignore this email or contact your college admin immediately.
          </p>
        </div>
        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
          <p style="color: #94a3b8; font-size: 0.75rem; margin: 0;">College ERP System &copy; 2026 &bull; Powered by Sarvam Indic AI</p>
        </div>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
      from: `"College ERP System 🎓" <${smtpUser}>`,
      to: email,
      subject: `[College ERP] ${otp} is your OTP – ${subjectLabel}`,
      html: htmlTemplate,
    });

    console.log(`[OTP Service] Email OTP sent to ${email} for purpose: ${purpose}`);
    return {
      success: true,
      provider: 'smtp',
      devOtp: otp, // Still returned so it displays on page as requested by user
      emailSent: true,
      message: `OTP sent to ${email} (also displayed on screen)`,
    };
  } catch (err) {
    console.error('[OTP Service] Email send error:', err.message);
    // Don't fail the entire user flow if email delivery fails; return OTP so they can proceed
    return {
      success: true,
      provider: 'smtp-fallback',
      devOtp: otp,
      emailSent: false,
      message: `OTP generated and displayed on screen (Email delivery failed: ${err.message})`,
    };
  }
};

// ─── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOTP = async (identifier, otp, purpose) => {
  const record = await Otp.findOne({
    identifier: identifier.toLowerCase(),
    purpose,
  });

  if (!record) {
    return { valid: false, message: 'OTP has expired or was not requested. Please request a new OTP.' };
  }

  if (record.otp !== String(otp)) {
    return { valid: false, message: 'Incorrect OTP entered. Please check and try again.' };
  }

  // OTP matched – delete it so it cannot be reused
  await Otp.deleteOne({ _id: record._id });
  return { valid: true };
};
