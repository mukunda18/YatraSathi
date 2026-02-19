import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string
) {
    await transporter.sendMail({
        from: process.env.SMTP_FROM || `YatraSathi <${process.env.SMTP_USER}>`,
        to,
        subject: "Reset Your YatraSathi Password",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 48px 24px; }
    .card { background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.08); }
    .logo { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: #6366f1; color: white; font-size: 24px; font-weight: 900; font-style: italic; margin-bottom: 24px; }
    h1 { color: #f8fafc; font-size: 24px; font-weight: 900; margin: 0 0 8px; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 900; font-size: 15px; }
    .divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0; }
    .footer { color: #475569; font-size: 12px; text-align: center; margin-top: 24px; }
    .url { word-break: break-all; color: #6366f1; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">Y</div>
      <h1>Reset Your Password</h1>
      <p>Hi ${name},<br/>Someone (hopefully you) requested a password reset for your YatraSathi account.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <hr class="divider" />
      <p>This link will expire in <strong style="color:#f8fafc">1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
      <p style="font-size:12px">Or copy this link into your browser:<br/><span class="url">${resetUrl}</span></p>
    </div>
    <p class="footer">© ${new Date().getFullYear()} YatraSathi. All rights reserved.</p>
  </div>
</body>
</html>`,
    });
}
