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
    .logo { display: block; width: 56px; height: 56px; border-radius: 14px; object-fit: contain; margin-bottom: 24px; }
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
      <img class="logo" src="/logo.png" alt="YatraSathi logo" />
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

export async function sendSupportEmail(
  fromEmail: string,
  name: string,
  subject: string,
  message: string
) {
  const supportEmail = process.env.SMTP_USER;

  await transporter.sendMail({
    from: `YatraSathi Support <${process.env.SMTP_USER}>`,
    to: supportEmail,
    replyTo: `${name} <${fromEmail}>`,
    subject: `[Support Ticket] ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 0; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 48px 24px; }
    .card { background: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.08); }
    h1 { color: #f8fafc; font-size: 20px; font-weight: 900; margin: 0 0 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; }
    .meta { margin-bottom: 24px; }
    .label { color: #475569; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: block; }
    .value { color: #f8fafc; font-size: 14px; margin-bottom: 16px; }
    .message-box { background: rgba(15, 23, 42, 0.5); border-radius: 12px; padding: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .footer { color: #475569; font-size: 11px; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <h1>New Support Request</h1>
      
      <div class="meta">
        <span class="label">From</span>
        <div class="value">${name} (${fromEmail})</div>
        
        <span class="label">Subject</span>
        <div class="value">${subject}</div>
      </div>
      
      <span class="label">Message</span>
      <div class="message-box">${message}</div>
    </div>
    <p class="footer">This is an automated notification from your YatraSathi Support Form.</p>
  </div>
</body>
</html>`,
  });
}
