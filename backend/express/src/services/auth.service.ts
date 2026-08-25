import { createHash, randomBytes, randomInt } from "node:crypto";
import { ApiError } from "../errors/api-error";
import { createAuthToken, hashPassword, verifyPassword } from "../lib/auth";
import { prisma } from "../prisma";
import type {
  CreateAdminInput,
  ForgotCustomerPasswordInput,
  ForgotAdminPasswordInput,
  LoginAdminInput,
  LoginCustomerInput,
  ResetAdminPasswordInput,
  SignupCustomerInput,
  VerifyAdminPasswordResetPinInput,
  VerifyAdminEmailInput,
} from "../schemas/auth.schema";
import { sendEmail } from "./email.service";

const verificationPinTtlMs = 10 * 60 * 1000;
const passwordResetPinTtlMs = 10 * 60 * 1000;

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

const customerSelect = {
  id: true,
  email: true,
  apiKey: true,
  firstName: true,
  lastName: true,
  imageId: true,
  age: true,
  contact: true,
  address: true,
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

export async function signupCustomer(data: SignupCustomerInput) {
  const { password, ...customerData } = data;

  const customer = await prisma.user.create({
    data: {
      ...customerData,
      role: "CUSTOMER",
      apiKey: createApiKey(),
      passwordHash: hashPassword(password),
    },
    select: customerSelect,
  });

  return {
    token: createAuthToken({ id: customer.id, role: "CUSTOMER" }),
    customer,
  };
}

export async function loginCustomer(data: LoginCustomerInput) {
  const user = await prisma.user.findFirst({
    where: { email: data.email, role: "CUSTOMER" },
    select: { ...customerSelect, passwordHash: true },
  });

  if (!user?.passwordHash || !verifyPassword(data.password, user.passwordHash)) {
    throw new ApiError("INVALID_CREDENTIALS");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    token: createAuthToken({ id: user.id, role: "CUSTOMER" }),
    customer: {
      id: user.id,
      email: user.email,
      apiKey: user.apiKey,
      firstName: user.firstName,
      lastName: user.lastName,
      imageId: user.imageId,
      age: user.age,
      contact: user.contact,
      address: user.address,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export async function sendCustomerPasswordReset(data: ForgotCustomerPasswordInput) {
  const customer = await prisma.user.findFirst({
    where: { email: data.email, role: "CUSTOMER" },
    select: { id: true, email: true },
  });

  if (!customer?.email) {
    throw new ApiError("NOT_FOUND", "Customer email was not found.");
  }

  const pin = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await prisma.passwordReset.upsert({
    where: { userId: customer.id },
    create: {
      userId: customer.id,
      pinHash: hashPin(pin),
      expiresAt: new Date(Date.now() + passwordResetPinTtlMs),
    },
    update: {
      pinHash: hashPin(pin),
      resetTokenHash: null,
      expiresAt: new Date(Date.now() + passwordResetPinTtlMs),
    },
  });

  await sendEmail({
    to: customer.email,
    subject: "Your Agentica password reset PIN",
    heading: "Reset your Agentica password",
    previewText: "Use this 6-digit PIN to reset your password.",
    message: `Your Agentica password reset PIN is ${pin}.\n\nThis PIN expires in 10 minutes.`,
    ctaLabel: "Open Agentica",
    ctaUrl: "https://agentica.vercel.app/forgot-password",
    footerText: "If you did not request this, you can ignore this email.",
  });

  return { email: customer.email };
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

export async function sendAdminPasswordReset(data: ForgotAdminPasswordInput) {
  let admin: { id: string; email: string | null; emailVerifiedAt: Date | null } | null;

  try {
    admin = await prisma.user.findFirst({
      where: { email: data.email, role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
  } catch (error) {
    console.error("Password reset admin lookup failed", error);
    throw new ApiError("BAD_REQUEST", "Could not send password reset PIN.");
  }

  if (!admin?.email) {
    throw new ApiError("NOT_FOUND", "Admin email was not found.");
  }

  if (!admin.emailVerifiedAt) {
    throw new ApiError("FORBIDDEN", "Admin email must be verified before resetting password.");
  }

  const pin = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const pinHash = hashPin(pin);
  const expiresAt = new Date(Date.now() + passwordResetPinTtlMs);

  try {
    await prisma.passwordReset.upsert({
      where: { userId: admin.id },
      create: {
        userId: admin.id,
        pinHash,
        expiresAt,
      },
      update: {
        pinHash,
        resetTokenHash: null,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Password reset PIN upsert failed", error);
    throw new ApiError("BAD_REQUEST", "Could not create password reset PIN.");
  }

  try {
    await sendEmail({
      to: admin.email,
      subject: "Your Agentica password reset PIN",
      heading: "Reset your Agentica admin password",
      previewText: "Use this 6-digit PIN to reset your admin password.",
      message: `Your Agentica password reset PIN is ${pin}.\n\nThis PIN expires in 10 minutes.`,
      ctaLabel: "Reset Password",
      ctaUrl: "https://agentica-admin.vercel.app/forgot-password",
      footerText: "If you did not request this, contact your Agentica super admin.",
    });
  } catch (error) {
    console.error("Password reset email failed", error);
    throw new ApiError("BAD_REQUEST", "Could not send password reset email.");
  }

  return { email: admin.email };
}

export async function verifyAdminPasswordResetPin(data: VerifyAdminPasswordResetPinInput) {
  let admin: { id: string; emailVerifiedAt: Date | null } | null;

  try {
    admin = await prisma.user.findFirst({
      where: { email: data.email, role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, emailVerifiedAt: true },
    });
  } catch (error) {
    console.error("Password reset admin lookup failed", error);
    throw new ApiError("BAD_REQUEST", "Could not reset password.");
  }

  if (!admin) {
    throw new ApiError("NOT_FOUND", "Admin email was not found.");
  }

  if (!admin.emailVerifiedAt) {
    throw new ApiError("FORBIDDEN", "Admin email must be verified before resetting password.");
  }

  let reset: { expiresAt: Date; pinHash: string } | null;

  try {
    reset = await prisma.passwordReset.findUnique({
      where: { userId: admin.id },
      select: { expiresAt: true, pinHash: true },
    });
  } catch (error) {
    console.error("Password reset PIN lookup failed", error);
    throw new ApiError("BAD_REQUEST", "Could not reset password.");
  }

  if (!reset || reset.expiresAt <= new Date() || reset.pinHash !== hashPin(data.pin)) {
    throw new ApiError("BAD_REQUEST", "Invalid or expired password reset PIN.");
  }

  const resetToken = randomBytes(32).toString("hex");

  try {
    await prisma.passwordReset.update({
      where: { userId: admin.id },
      data: { resetTokenHash: hashPin(resetToken) },
    });
  } catch (error) {
    console.error("Password reset PIN verification failed", error);
    throw new ApiError("BAD_REQUEST", "Could not verify password reset PIN.");
  }

  return { resetToken };
}

export async function resetAdminPassword(data: ResetAdminPasswordInput) {
  let admin: { id: string; emailVerifiedAt: Date | null } | null;

  try {
    admin = await prisma.user.findFirst({
      where: { email: data.email, role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, emailVerifiedAt: true },
    });
  } catch (error) {
    console.error("Password reset admin lookup failed", error);
    throw new ApiError("BAD_REQUEST", "Could not reset password.");
  }

  if (!admin) {
    throw new ApiError("NOT_FOUND", "Admin email was not found.");
  }

  if (!admin.emailVerifiedAt) {
    throw new ApiError("FORBIDDEN", "Admin email must be verified before resetting password.");
  }

  let reset: { expiresAt: Date; resetTokenHash: string | null } | null;

  try {
    reset = await prisma.passwordReset.findUnique({
      where: { userId: admin.id },
      select: { expiresAt: true, resetTokenHash: true },
    });
  } catch (error) {
    console.error("Password reset token lookup failed", error);
    throw new ApiError("BAD_REQUEST", "Could not reset password.");
  }

  if (
    !reset ||
    reset.expiresAt <= new Date() ||
    !reset.resetTokenHash ||
    reset.resetTokenHash !== hashPin(data.resetToken)
  ) {
    throw new ApiError("BAD_REQUEST", "Invalid or expired password reset session.");
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash: hashPassword(data.password) },
      }),
      prisma.passwordReset.delete({ where: { userId: admin.id } }),
    ]);
  } catch (error) {
    console.error("Password reset update failed", error);
    throw new ApiError("BAD_REQUEST", "Could not reset password.");
  }

  return { success: true };
}

function hashPin(pin: string) {
  return createHash("sha256").update(pin).digest("hex");
}

function createApiKey() {
  return `ag_${randomBytes(32).toString("hex")}`;
}
