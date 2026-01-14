"use server"

import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

const usersPath = path.join(process.cwd(), 'data', 'users.json');

// 1. Create the Transporter using your Google credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function signUpUser(formData: any) {
  try {
    const fileData = await fs.readFile(usersPath, 'utf8');
    const users = JSON.parse(fileData);

    if (users.find((u: any) => u.email === formData.email)) {
      return { success: false, error: "User already exists" };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = {
      id: `user_${Date.now()}`,
      role: formData.role,
      profile: {
        fullName: formData.fullName,
        initials: formData.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        domain: "General Learning" 
      },
      stats: { videoWatchedMins: 0, questionsAttempted: 0, monthlyProgress: [] },
      college: { 
        name: formData.college, 
        degree: formData.degree, 
        year: parseInt(formData.year) 
      },
      email: formData.email,
      hasPremium: false,
      enrolledCourses: [],
      isVerified: false,
      currentOtp: otpCode 
    };

    // 2. Save to JSON
    users.push(newUser);
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

    // 3. Send Email using Nodemailer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: formData.email,
      subject: 'Verify your account',
      html: `
        <div style="font-family: sans-serif; text-align: center;">
          <h2>Welcome to the Platform!</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="color: #2563eb;">${otpCode}</h1>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create user or send email" };
  }
}

// ... (keep your verifyUserOtp function from the previous step)

export async function verifyUserOtp(email: string, otp: string) {
    const fileData = await fs.readFile(usersPath, 'utf8');
    let users = JSON.parse(fileData);
    
    const userIndex = users.findIndex((u: any) => u.email === email && u.currentOtp === otp);
    
    if (userIndex === -1) return { success: false, error: "Invalid OTP" };

    users[userIndex].isVerified = true;
    delete users[userIndex].currentOtp; // Remove OTP after verification

    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
    return { success: true };
}