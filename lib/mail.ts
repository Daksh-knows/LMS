import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmailInternal(email: string, otp: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verification Code",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Your Academy Verification</h2>
        <p>Your code is: <strong style="font-size: 24px; letter-spacing: 2px;">${otp}</strong></p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}