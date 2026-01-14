"use server"

import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

const usersPath = path.join(process.cwd(), 'data', 'users.json');

const USERS_DB = path.join(process.cwd(), "data/users.json");
const ALL_USERS_PATH = path.join(process.cwd(), "data/users.json");
const CURRENT_USER_PATH = path.join(process.cwd(), "data/user.json");

// 1. Create the Transporter using your Google credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function ensureFiles() {
  try {
    await fs.access(USERS_DB);
  } catch {
    await fs.writeFile(USERS_DB, JSON.stringify([]));
  }
}

export async function signInUser(formData: any) {
  try {
    // Destructure email and password from the passed object
    const { email, password } = formData;
    
    console.log("Attempting login for:", email);

    // 1. Read the entire database
    const allUsersData = await fs.readFile(ALL_USERS_PATH, "utf-8");
    const allUsers = JSON.parse(allUsersData);

    // 2. Find the user
    const fullUserData = allUsers.find(
      (u: any) => u.email === email && u.password === password
    );

    if (!fullUserData) {
      return { success: false, error: "Invalid credentials" };
    }

    // 3. Update the session file (user.json)
    await fs.writeFile(CURRENT_USER_PATH, JSON.stringify(fullUserData, null, 2));

    return { success: true };
  } catch (error) {
    console.error("Auth Error:", error);
    return { success: false, error: "Database access failed" };
  }
}

export async function signUpUser(formData: any) {
  try {
    const { email, password } = formData;

    // 1. Read existing users from the database
    let allUsers = [];
    try {
      const data = await fs.readFile(ALL_USERS_PATH, "utf-8");
      allUsers = JSON.parse(data);
    } catch (err) {
      // If file doesn't exist, we start with an empty array
      allUsers = [];
    }

    // 2. Check if the user already exists
    if (allUsers.some((u: any) => u.email === email)) {
      return { success: false, error: "An account with this email already exists." };
    }

    // 3. Create the full user object
    const newUser = {
      email,
      password,
      role: "student",       // Default role
      hasPremium: false,     // Default payment status
      joinedAt: new Date().toISOString(),
      fullName: formData.fullName || "User" ,
      stats: {
      "videoWatchedMins": 0,
      "questionsAttempted": 0,
      "monthlyProgress": []
      },
      enrolledCourses: []
    };

    // 4. Update the main database (users.json)
    allUsers.push(newUser);
    await fs.writeFile(ALL_USERS_PATH, JSON.stringify(allUsers, null, 2));

    // 5. Sync this data to the active session file (user.json)
    // This effectively "logs them in" immediately after signup
    await fs.writeFile(CURRENT_USER_PATH, JSON.stringify(newUser, null, 2));

    return { success: true };
  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, error: "Failed to create account. Please try again." };
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

export async function upgradeToPremium() {
  try {
    // 1. Get the current logged-in user's data
    const sessionData = await fs.readFile(CURRENT_USER_PATH, "utf-8");
    const currentUser = JSON.parse(sessionData);

    // 2. Read the main database
    const allUsersData = await fs.readFile(ALL_USERS_PATH, "utf-8");
    let allUsers = JSON.parse(allUsersData);

    // 3. Update the user in the main database array
    allUsers = allUsers.map((user: any) => {
      if (user.email === currentUser.email) {
        return { ...user, hasPremium: true };
      }
      return user;
    });

    // 4. Update the current session data
    const updatedUser = { ...currentUser, hasPremium: true };

    // 5. Save both files
    await fs.writeFile(ALL_USERS_PATH, JSON.stringify(allUsers, null, 2));
    await fs.writeFile(CURRENT_USER_PATH, JSON.stringify(updatedUser, null, 2));

    return { success: true };
  } catch (error) {
    console.error("Failed to upgrade user:", error);
    return { success: false };
  }
}

export async function sendOtpEmail(email: string) {
  try {
    // 1. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Read the database and find the user
    const data = await fs.readFile(USERS_DB, "utf-8");
    let users = JSON.parse(data);
    const userIndex = users.findIndex((u: any) => u.email === email);

    if (userIndex === -1) return { success: false, error: "User not found" };

    // 3. Save the OTP to the user's record temporarily
    users[userIndex].currentOtp = otp;
    await fs.writeFile(USERS_DB, JSON.stringify(users, null, 2));

    // 4. Send the Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #16a34a;">Verification Code</h2>
          <p>Your code for Your Academy is:</p>
          <h1 style="letter-spacing: 5px; color: #111827;">${otp}</h1>
          <p>This code will expire shortly. Do not share it with anyone.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: "Failed to send email" };
  }
}