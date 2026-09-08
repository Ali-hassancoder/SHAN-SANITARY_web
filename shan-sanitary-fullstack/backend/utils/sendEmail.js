import nodemailer from "nodemailer";

const isEmailConfigured = () =>
  process.env.EMAIL_HOST &&
  process.env.EMAIL_HOST !== "YOUR_SMTP_HOST" &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_USER !== "YOUR_SMTP_USER";

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    // Dev fallback — no real SMTP configured yet. Log instead of silently failing.
    console.log("\n=== EMAIL (dev mode — no SMTP configured) ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("=== END EMAIL ===\n");
    return { devMode: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { devMode: false };
};

export default sendEmail;