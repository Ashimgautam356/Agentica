import { ApiError } from "../errors/api-error";
import { createAuthToken, hashPassword, verifyPassword } from "../lib/auth";
import { prisma } from "../prisma";
import type { CreateAdminInput, LoginAdminInput } from "../schemas/auth.schema";

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
