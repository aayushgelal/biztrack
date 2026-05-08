import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import {
  verifyPassword,
  generateToken,
  setAuthCookie,
  hashPassword,
} from "@/lib/auth";

// ─── Gmail SMTP transporter (free) ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your real password)
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genOTP  = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
const OTP_TTL = 10 * 60 * 1000; // 10 minutes in ms

async function sendOTPEmail(to: string, otp: string, businessName?: string | null) {
  await transporter.sendMail({
    from: `"Pasalee" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Pasalee — Password Reset OTP",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f2f2f7;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;background:#10B981;border-radius:12px;padding:12px 20px">
            <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px">🌿 Pasalee</span>
          </div>
        </div>
        <div style="background:#fff;border-radius:12px;padding:28px">
          <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1c1c1e">
            नमस्ते${businessName ? `, ${businessName}` : ""}!
          </p>
          <p style="margin:0 0 24px;font-size:13px;color:#6b7280">
            तपाईँले पासवर्ड रिसेट अनुरोध गर्नुभएको छ।<br/>
            <span style="color:#9ca3af">You requested a password reset.</span>
          </p>
          <div style="text-align:center;background:#ecfdf5;border-radius:12px;padding:24px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase">
              One-Time Password
            </p>
            <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:8px;color:#059669">
              ${otp}
            </p>
          </div>
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">
            यो OTP 10 मिनेटमा expire हुन्छ · Expires in 10 minutes.<br/>
            यदि तपाईँले यो request गर्नुभएको छैन भने यसलाई बेवास्ता गर्नुहोस्।<br/>
            <span style="color:#d1d5db">If you didn't request this, ignore this email.</span>
          </p>
        </div>
        <p style="text-align:center;font-size:10px;color:#9ca3af;margin-top:16px">
          Pasalee · तपाईँको भरपर्दो खाता
        </p>
      </div>
    `,
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── 1. REQUEST OTP ─────────────────────────────────────────────────────
    if (action === "resetPassword") {
      const { identifier } = body; // username or email
      if (!identifier) {
        return NextResponse.json({ error: "Username or email required" }, { status: 400 });
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: identifier },
            { email: identifier },
          ],
        },
      });

      // Always return success to prevent user enumeration
      if (!user?.email) {
        return NextResponse.json({ success: true });
      }

      // Invalidate any existing unused OTPs for this user
      await prisma.passwordReset.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });

      const otp = genOTP();
      await prisma.passwordReset.create({
        data: {
          userId:    user.id,
          otp,
          expiresAt: new Date(Date.now() + OTP_TTL),
        },
      });

      await sendOTPEmail(user.email, otp, user.businessName);
      return NextResponse.json({ success: true });
    }

    // ── 2. VERIFY OTP ──────────────────────────────────────────────────────
    if (action === "verifyOTP") {
      const { identifier, otp } = body;
      if (!identifier || !otp) {
        return NextResponse.json({ error: "Identifier and OTP required" }, { status: 400 });
      }

      const user = await prisma.user.findFirst({
        where: { OR: [{ username: identifier }, { email: identifier }] },
      });
      if (!user) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      const record = await prisma.passwordReset.findFirst({
        where: {
          userId:    user.id,
          otp,
          used:      false,
          expiresAt: { gt: new Date() },
        },
      });
      if (!record) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // Mark OTP as used only after new password is set — return a short-lived token
      return NextResponse.json({ success: true, resetToken: record.id });
    }

    // ── 3. SET NEW PASSWORD ────────────────────────────────────────────────
    if (action === "setNewPassword") {
      const { resetToken, newPassword } = body;
      if (!resetToken || !newPassword) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const record = await prisma.passwordReset.findUnique({
        where: { id: resetToken },
        include: { user: true },
      });

      if (!record || record.used || record.expiresAt < new Date()) {
        return NextResponse.json({ error: "Reset session expired. Please try again." }, { status: 400 });
      }

      // Update password + invalidate token atomically
      await prisma.$transaction([
        prisma.user.update({
          where: { id: record.userId },
          data: { password: await hashPassword(newPassword) },
        }),
        prisma.passwordReset.update({
          where: { id: resetToken },
          data: { used: true },
        }),
      ]);

      return NextResponse.json({ success: true });
    }

    // ── 4. REGISTER ────────────────────────────────────────────────────────
    if (action === "register") {
      const { username, password, businessName, email } = body;
      if (!username || !password) {
        return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
      }
      if (!businessName) {
        return NextResponse.json({ error: "Business name required" }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json({ error: "Username taken" }, { status: 409 });
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          businessName,
          role: "MERCHANT",
          ...(email ? { email } : {}),
        },
      });

      const device = await prisma.device.create({
        data: {
          name: "Main Soundbox",
          serialNumber: `ET-${Date.now()}`,
          userId: user.id,
          type: "ET389",
        },
      });

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      await prisma.subscription.create({
        data: {
          userId: user.id,
          deviceId: device.id,
          amount: 0,
          plan: "trial",
          status: "active",
          currency: "NPR",
          endDate,
        },
      });

      const token = generateToken({
        userId: user.id,
        username,
        businessName,
        role: "MERCHANT",
        parentId: undefined,
      });
      setAuthCookie(token);

      return NextResponse.json({
        success: true,
        user: { id: user.id, username, businessName, role: "MERCHANT" },
      });
    }

    // ── 5. LOGIN ───────────────────────────────────────────────────────────
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { parent: true },
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const effectiveBusinessName =
      user.role === "STAFF"
        ? user.parent?.businessName || "Staff Account"
        : user.businessName;

    const token = generateToken({
      userId: user.id,
      username: user.username,
      businessName: effectiveBusinessName,
      role: user.role,
      parentId: user.parentId || undefined,
    });
    setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        businessName: effectiveBusinessName,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const { clearAuthCookie } = await import("@/lib/auth");
  clearAuthCookie();
  return NextResponse.json({ success: true });
}