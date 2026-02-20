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

export async function sendForgotPasswordLink(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password Link",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Your Academy Verification</h2>
        <p>Your code is: <strong style="font-size: 24px; letter-spacing: 2px;">${resetUrl}</strong></p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

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

export const sendLectureNotification = async (
  email: string,
  courseName: string,
  lectureTitle: string,
  type: string
) => {
  const typeLabels: Record<string, string> = {
    VIDEO: "Video Lecture",
    ASSIGNMENT: "New Assignment",
    QUIZ: "New Quiz",
    TEXT: "Reading Material",
    LIVE: "Live Session"
  };

  const label = typeLabels[type] || "New Content";

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px;">New Content Added!</h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Exciting news! A new <strong>${label}</strong> has been added to your course: <strong>${courseName}</strong>.</p>
        
        <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #1e293b;">${lectureTitle}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Type: ${label}</p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${process.env.APP_URL}/dashboard/my-courses" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Start Learning</a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} Your Academy. All rights reserved.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Academy Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `New Content: ${lectureTitle} | ${courseName}`,
    html: htmlContent,
  });
};

export const sendGradingNotification = async (
  email: string,
  studentName: string,
  lectureTitle: string,
  grade: number,
  feedback?: string
) => {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
      <h2 style="color: #1e293b;">Assignment Graded!</h2>
      <p>Hello ${studentName || 'Student'},</p>
      <p>Your submission for <strong>${lectureTitle}</strong> has been reviewed and graded.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px;"><strong>Grade:</strong> ${grade}%</p>
        ${feedback ? `<p style="margin: 10px 0 0 0; color: #475569;"><strong>Feedback:</strong> ${feedback}</p>` : ''}
      </div>

      <a href="${process.env.APP_URL}/dashboard" 
         style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
         View in Dashboard
      </a>
    </div>
  `;

  return transporter.sendMail({
    from: `"Course Academy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Grade Received: ${lectureTitle}`, 
    html: htmlContent,
  });
};