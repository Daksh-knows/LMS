import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { user_email, temp_password, courseId, courseType  } = await req.json();
    console.log("email = " + user_email);
    console.log("temp_password = " + temp_password);
    console.log("courseId = " + courseId);
    console.log("courseType = " + courseType);
    
    if (!user_email) {
      return NextResponse.json({ error: "Missing credentials - email id" }, { status: 400 });
    }
    // 1. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: user_email },
    });
    
    if (existingUser) {
      if(courseId){
        const checkEnrollment = await db.myEnrollment.findFirst({
          where : {
            userId : existingUser.id,
            courseId: courseId,
          }
        });
        if(checkEnrollment) {
          return NextResponse.json({message: "User already enrolled in this course."}, {status: 200});
        }
        await db.myEnrollment.create({data : {userId: existingUser.id, courseId: courseId}});
        return NextResponse.json({message: "User enrolled successfully in the course."}, {status: 201});
      }
      return NextResponse.json({message: "User already exists."}, { status : 409})
    }
    if(!temp_password){
      return NextResponse.json({ error: "Missing credentials - password" }, { status: 400 });
    }
    
    // 2. Hash the temporary password
    const hashedPassword = await bcrypt.hash(temp_password, 10);
    
    
    // 3. Create the new user with the flag set to true
    const user = await db.$transaction ( async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: user_email, 
          password: hashedPassword,
          isTempPassword: true,
          isVerified: true,
          role: "STUDENT",
        }
      });
      if(courseId){
        await tx.myEnrollment.create({
          data: {
            userId: newUser.id,
            courseId: courseId,
          }
        })
      }
      return newUser;
    });


    return NextResponse.json({ 
      success: true, 
      userId: user.id 
    }, { status: 201 });

  } catch (error) {
    console.error("INGEST_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}