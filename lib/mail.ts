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

// --- NEW FUNCTION ---
export async function sendRefundStatusEmail(
  email: string, 
  name: string, 
  status: 'APPROVED' | 'REJECTED',
  amount?: number
) {
  const subject = status === 'APPROVED' 
    ? "Refund Approved & Processed" 
    : "Update regarding your Refund Request";

  const approvedHtml = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #16a34a;">Refund Initiated</h2>
      <p>Hi ${name},</p>
      <p>Your refund request for <strong>₹${amount ? (amount).toLocaleString() : 'the course'}</strong> has been approved and initiated.</p>
      <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">APPROVED</span></p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px;">Please Note:</p>
        <ul style="font-size: 14px; margin-top: 5px;">
          <li>The amount will reflect in your original payment source within <strong>5-7 business days</strong>.</li>
          <li>Your premium access to the platform has been revoked effective immediately.</li>
        </ul>
      </div>
      <p>If you have any questions, feel free to reply to this email.</p>
    </div>
  `;

  const rejectedHtml = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #dc2626;">Refund Request Update</h2>
      <p>Hi ${name},</p>
      <p>We reviewed your request for a refund regarding your recent purchase.</p>
      <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">DECLINED</span></p>
      <p>After reviewing our policy and your account activity, we are unable to process this refund at this time.</p>
      <p>If you believe this is an error, please contact our support team.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: status === 'APPROVED' ? approvedHtml : rejectedHtml,
  });
}