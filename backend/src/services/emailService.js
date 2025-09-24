// Lightweight email service with graceful fallback if nodemailer is not installed
// Configure via env:
// - GMAIL_USER (required)
// - GMAIL_PASS (required, use App Password)
// - FROM_EMAIL (optional, defaults to gmail user or hardcoded fallback)

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

async function sendMail({ to, subject, text, html }) {
  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch (e) {
    console.warn("nodemailer is not installed. Skipping email send.");
    return { skipped: true };
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  const from = process.env.FROM_EMAIL || user || "rachhadiyahit@gmail.com";

  if (!user || !pass) {
    console.warn("GMAIL_USER/GMAIL_PASS not configured. Skipping email send.");
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { messageId: info.messageId };
}

async function sendApplicationStatusEmail({ to, status, name, jobTitle, companyName }) {
  const { subject, text, html } = buildStatusEmail({ status, name, jobTitle, companyName });
  return sendMail({ to, subject, text, html });
}

module.exports = {
  sendApplicationStatusEmail,
};
