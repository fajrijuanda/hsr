import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        hasSetUid: false,
      },
    });

    // Store OTP in verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires: otpExpires,
        type: "email",
      },
    });

    // TODO: Send email with OTP
    // For now, log it (in production, use nodemailer/resend)
    console.log(`[DEV] OTP for ${email}: ${otp}`);

    // In development, return OTP for testing
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        success: true,
        message: "Account created. Check console for OTP.",
        devOtp: otp, // Remove in production!
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Account created. Please check your email for verification code.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
