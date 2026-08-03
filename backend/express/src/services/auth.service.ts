import { createHash, randomInt } from "node:crypto";
import { ApiError } from "../errors/api-error";
import { createAuthToken, hashPassword, verifyPassword } from "../lib/auth";
import { prisma } from "../prisma";
import type {
  CreateAdminInput,
  LoginAdminInput,
  VerifyAdminEmailInput,
} from "../schemas/auth.schema";
import { sendEmail } from "./email.service";

const verificationPinTtlMs = 10 * 60 * 1000;

const adminSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function loginAdmin(data: LoginAdminInput) {
  const user = await prisma.user.findFirst({
    where: { email: data.email, role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { ...adminSelect, passwordHash: true },
  });

  if (!user?.passwordHash || !verifyPassword(data.password, user.passwordHash)) {
    throw new ApiError("INVALID_CREDENTIALS");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const admin = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  const role = admin.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";

  return {
    token: createAuthToken({ id: admin.id, role }),
    admin,
  };
}

export async function createAdmin(superAdminId: string, data: CreateAdminInput) {
  const superAdmin = await prisma.user.findUnique({
    where: { id: superAdminId },
    select: { role: true, emailVerifiedAt: true },
  });

  if (superAdmin?.role !== "SUPER_ADMIN") {
    throw new ApiError("FORBIDDEN");
  }

  if (!superAdmin.emailVerifiedAt) {
    throw new ApiError("FORBIDDEN", "Super admin account must be verified before creating admins.");
  }

  const { password, ...adminData } = data;

  return prisma.user.create({
    data: {
      ...adminData,
      role: "ADMIN",
      passwordHash: hashPassword(password),
    },
    select: adminSelect,
  });
}

export async function getCurrentAdmin(adminId: string) {
  if (!adminId) {
    throw new ApiError("UNAUTHORIZED");
  }

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      imageId: true,
      role: true,
      emailVerifiedAt: true,
    },
  });

  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
    throw new ApiError("UNAUTHORIZED");
  }

  return {
    id: admin.id,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    image: admin.imageId,
    role: admin.role,
    emailVerifiedAt: admin.emailVerifiedAt,
  };
}

export async function sendAdminEmailVerification(adminId: string) {
  const admin = await getCurrentAdmin(adminId);

  if (admin.emailVerifiedAt) {
    return admin;
  }

  if (!admin.email) {
    throw new ApiError("BAD_REQUEST", "Admin account does not have an email address.");
  }

  const pin = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await prisma.emailVerification.upsert({
    where: { userId: admin.id },
    create: {
      userId: admin.id,
      pinHash: hashPin(pin),
      expiresAt: new Date(Date.now() + verificationPinTtlMs),
    },
    update: {
      pinHash: hashPin(pin),
      expiresAt: new Date(Date.now() + verificationPinTtlMs),
    },
  });

  await sendEmail({
    to: admin.email,
    subject: "Your Agentica verification PIN",
    heading: "Verify your Agentica admin email",
    previewText: "Use this 6-digit PIN to verify your admin account.",
    message: `Your Agentica verification PIN is ${pin}.\n\nThis PIN expires in 10 minutes.`,
    ctaLabel: "Open Agentica Admin",
    ctaUrl: "https://agentica-admin.vercel.app/verify-email",
    footerText: "If you did not request this, you can ignore this email.",
  });

  return admin;
}

export async function verifyAdminEmail(adminId: string, data: VerifyAdminEmailInput) {
  const admin = await getCurrentAdmin(adminId);

  if (admin.emailVerifiedAt) {
    return admin;
  }

  const verification = await prisma.emailVerification.findUnique({
    where: { userId: admin.id },
  });

  if (
    !verification ||
    verification.expiresAt <= new Date() ||
    verification.pinHash !== hashPin(data.pin)
  ) {
    throw new ApiError("BAD_REQUEST", "Invalid or expired verification PIN.");
  }

  await prisma.emailVerification.delete({ where: { userId: admin.id } });

  return prisma.user.update({
    where: { id: admin.id },
    data: { emailVerifiedAt: new Date() },
    select: adminSelect,
  });
}

function hashPin(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}
