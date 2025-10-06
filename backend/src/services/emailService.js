// Lightweight email service with graceful fallback if nodemailer is not installed
// Configure via env:
// - GMAIL_USER (required)
// - GMAIL_PASS (required, use App Password)
// - FROM_EMAIL (optional, defaults to gmail user or hardcoded fallback)
// Optional advanced config for production:
// - SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false)
// - SMTP_USER, SMTP_PASS (overrides GMAIL_* if provided)
// - SMTP_CONN_TIMEOUT, SMTP_GREET_TIMEOUT (ms)
// - RESEND_API_KEY (if set, will prefer HTTP-based email to avoid SMTP egress issues)

const axios = require("axios");

function buildStatusEmail({ status, name, jobTitle, companyName }) {
  const safeName = name || "Job Seeker";
  const title = jobTitle || "the job";
  const company = companyName || "the company";

  if (status === "HIRED") {
    const subject = `You're Hired for ${title}! Next Steps Inside`;
    const text = `Hi ${safeName},\n\nCongratulations! You have been hired for ${title} at ${company}.\n\nNext steps:\n1) Upload your Aadhaar card (front & back) in your Job Gujarat account.\n2) Pay the approval fee shown in your application details.\n3) Complete any remaining onboarding steps.\n\nGo to: Job Gujarat > My Applications > ${title}.\n\nIf you have any questions, reply to this email.\n\n— Job Gujarat Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111">
        <h2 style="margin:0 0 8px">Congratulations, ${safeName}! 🎉</h2>
        <p>You've been <strong>HIRED</strong> for <strong>${title}</strong> at <strong>${company}</strong>.</p>
        <h3 style="margin:16px 0 8px">Next steps:</h3>
        <ol>
          <li>Upload your <strong>Aadhaar card</strong> (front & back) in your Job Gujarat account.</li>
          <li>Pay the <strong>approval fee</strong> shown in your application details.</li>
          <li>Complete any remaining onboarding steps.</li>
        </ol>
        <p>
          Open your dashboard: <strong>Job Gujarat → My Applications → ${title}</strong>
        </p>
        <p style="margin-top:16px">If you have questions, just reply to this email.</p>
        <p style="margin-top:24px">— <em>Job Gujarat Team</em></p>
      </div>
    `;
    return { subject, text, html };
  }

  // Default to REJECTED template
  const subject = `Update on your application for ${title}`;
  const text = `Hi ${safeName},\n\nThank you for applying to ${title} at ${company}.\nAfter careful review, we won't be moving forward at this time.\n\nWe encourage you to:\n• Browse other jobs on Job Gujarat\n• Update your profile and resume\n• Keep applying — the right role is ahead!\n\nWishing you the best in your job search.\n\n— Job Gujarat Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111">
      <h2 style="margin:0 0 8px">Application Update</h2>
      <p>
        Thank you for applying to <strong>${title}</strong> at <strong>${company}</strong>.
        After careful review, we won't be moving forward at this time.
      </p>
      <p>We encourage you to:</p>
      <ul>
        <li>Browse other jobs on <strong>Job Gujarat</strong></li>
        <li>Update your profile and resume</li>
        <li>Keep applying — the right role is ahead!</li>
      </ul>
      <p style="margin-top:16px">Wishing you the best in your job search.</p>
      <p style="margin-top:24px">— <em>Job Gujarat Team</em></p>
    </div>
  `;
  return { subject, text, html };
}

async function sendViaResend({ from, to, subject, text, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true };

  try {
    const res = await axios.post(
      "https://api.resend.com/emails",
      {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || undefined,
        text: text || undefined,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );
    return { messageId: res.data?.id || res.data?.data?.id || "resend" };
  } catch (err) {
    // Surface compact error for upstream logging
    const code = err.response?.status || err.code;
    const detail = err.response?.data || err.message;
    throw new Error(`Resend error (${code}): ${typeof detail === "string" ? detail : JSON.stringify(detail)}`);
  }
}

async function sendMail({ to, subject, text, html }) {
  // Determine sender
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  const smtpUser = process.env.SMTP_USER || gmailUser;
  const smtpPass = process.env.SMTP_PASS || gmailPass;
  const from = process.env.FROM_EMAIL || smtpUser || "rachhadiyahit@gmail.com";

  // Try HTTP provider first if available (more reliable on serverless / egress-restricted hosts)
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend({ from, to, subject, text, html });
    } catch (err) {
      // Log and continue to SMTP fallback
      console.error("Resend failed, falling back to SMTP:", err.message || err);
    }
  }

  // Fallback to SMTP via Nodemailer
  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch (e) {
    console.warn("nodemailer is not installed. Skipping email send.");
    return { skipped: true };
  }

  if (!smtpUser || !smtpPass) {
    console.warn("SMTP/GMAIL credentials not configured. Skipping email send.");
    return { skipped: true };
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const secure = process.env.SMTP_SECURE ? String(process.env.SMTP_SECURE).toLowerCase() === "true" : undefined;
  const connTimeout = process.env.SMTP_CONN_TIMEOUT ? parseInt(process.env.SMTP_CONN_TIMEOUT, 10) : 15000;
  const greetTimeout = process.env.SMTP_GREET_TIMEOUT ? parseInt(process.env.SMTP_GREET_TIMEOUT, 10) : 15000;

  const useExplicitHost = Boolean(host);

  const transportOptions = useExplicitHost
    ? {
        host,
        port: port ?? 465,
        secure: secure ?? true, // default to SMTPS
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: connTimeout,
        greetingTimeout: greetTimeout,
        tls: { servername: host },
        pool: false,
      }
    : {
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: connTimeout,
        greetingTimeout: greetTimeout,
        pool: false,
      };

  const transporter = nodemailer.createTransport(transportOptions);

  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    return { messageId: info.messageId };
  } catch (err) {
    // If SMTP times out and HTTP provider is available but not yet tried, attempt as last resort
    if (!process.env.RESEND_API_KEY) {
      throw err;
    }
    try {
      return await sendViaResend({ from, to, subject, text, html });
    } catch (fallbackErr) {
      // Bubble up SMTP error with context plus fallback error message
      const parts = [];
      if (err && err.code) parts.push(`smtpCode=${err.code}`);
      if (err && err.command) parts.push(`smtpCmd=${err.command}`);
      parts.push(`smtpMsg=${err?.message || err}`);
      parts.push(`resendMsg=${fallbackErr?.message || fallbackErr}`);
      throw new Error(`Email send failed: ${parts.join("; ")}`);
    }
  }
}

async function sendApplicationStatusEmail({ to, status, name, jobTitle, companyName }) {
  const { subject, text, html } = buildStatusEmail({ status, name, jobTitle, companyName });
  return sendMail({ to, subject, text, html });
}

module.exports = {
  sendApplicationStatusEmail,
};
