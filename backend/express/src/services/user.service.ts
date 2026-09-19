import { randomBytes } from "node:crypto";
import { ApiError } from "../errors/api-error";
import { hashPassword, verifyPassword } from "../lib/auth";
import { paginatedResult, type Pagination } from "../lib/pagination";
import { prisma } from "../prisma";
import type { UpdateAdminInput } from "../schemas/auth.schema";
import type {
  UpdateCustomerPasswordInput,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserPasswordInput,
} from "../schemas/user.schema";

const userSelect = {
  id: true,
  email: true,
  apiKey: true,
  role: true,
  firstName: true,
  lastName: true,
  imageId: true,
  age: true,
  dob: true,
  gender: true,
  contact: true,
  address: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  sessions: {
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  },
} as const;

export async function listUsers(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      select: userSelect,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.user.count(),
  ]);

  return paginatedResult(items, total, pagination);
}

export async function listCustomers(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: userSelect,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return paginatedResult(items, total, pagination);
}

export async function listAdmins(pagination: Pagination) {
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: { role: "ADMIN" },
      select: userSelect,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
    }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  return paginatedResult(items, total, pagination);
}

export function getUser(id: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id },
    select: userSelect,
  });
}

export function getCustomer(id: string) {
  return prisma.user.findFirstOrThrow({
    where: { id, role: "CUSTOMER" },
    select: userSelect,
  });
}

export function createUser(data: CreateUserInput) {
  const { password, ...userData } = data;

  return prisma.user.create({
    data: {
      ...userData,
      passwordHash: hashPassword(password),
    },
    select: userSelect,
  });
}

export async function updateCustomer(id: string, data: UpdateUserInput) {
  await getCustomer(id);

  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function updateCustomerPassword(id: string, data: UpdateUserPasswordInput) {
  await getCustomer(id);

  return prisma.user.update({
    where: { id },
    data: {
      passwordHash: hashPassword(data.password),
    },
    select: userSelect,
  });
}

export async function disableCustomerApiKey(id: string) {
  await getCustomer(id);

  return prisma.user.update({
    where: { id },
    data: { apiKey: null },
    select: userSelect,
  });
}

export async function updateMyPassword(id: string, data: UpdateCustomerPasswordInput) {
  let customer: {
    id: string;
    passwordHash: string | null;
    emailVerifiedAt: Date | null;
  } | null;

  try {
    customer = await prisma.user.findFirst({
      where: { id, role: "CUSTOMER" },
      select: { id: true, passwordHash: true, emailVerifiedAt: true },
    });
  } catch (error) {
    console.error("Customer password lookup failed", error);
    throw new ApiError("BAD_REQUEST", "Could not update password.");
  }

  if (!customer) {
    throw new ApiError("UNAUTHORIZED");
  }

  if (!customer.emailVerifiedAt) {
    throw new ApiError("FORBIDDEN", "Please verify the email first.");
  }

  if (!customer.passwordHash || !verifyPassword(data.currentPassword, customer.passwordHash)) {
    throw new ApiError("INVALID_CREDENTIALS", "Current password is incorrect.");
  }

  try {
    return await prisma.user.update({
      where: { id: customer.id },
      data: {
        passwordHash: hashPassword(data.newPassword),
      },
      select: userSelect,
    });
  } catch (error) {
    console.error("Customer password update failed", error);
    throw new ApiError("BAD_REQUEST", "Could not update password.");
  }
}

export async function regenerateCustomerApiKey(id: string) {
  const customer = await getCustomer(id);

  if (!customer.emailVerifiedAt) {
    throw new ApiError("FORBIDDEN", "Please verify the email first.");
  }

  return prisma.user.update({
    where: { id },
    data: { apiKey: createApiKey() },
    select: userSelect,
  });
}

export async function deleteCustomer(id: string) {
  const result = await prisma.user.deleteMany({
    where: { id, role: "CUSTOMER" },
  });

  if (result.count === 0) {
    throw new ApiError("NOT_FOUND");
  }
}

export async function deleteCustomerSession(userId: string, sessionId: string) {
  const result = await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId,
      user: { role: "CUSTOMER" },
    },
  });

  if (result.count === 0) {
    throw new ApiError("NOT_FOUND", "Session not found.");
  }
}

export async function deleteAdmin(id: string) {
  const result = await prisma.user.deleteMany({
    where: { id, role: "ADMIN" },
  });

  if (result.count === 0) {
    throw new ApiError("NOT_FOUND");
  }
}

export async function updateAdmin(id: string, data: UpdateAdminInput) {
  const { password, ...adminData } = data;

  await prisma.user.findFirstOrThrow({
    where: { id, role: "ADMIN" },
    select: { id: true },
  });

  return prisma.user.update({
    where: { id },
    data: {
      ...adminData,
      ...(password ? { passwordHash: hashPassword(password) } : {}),
    },
    select: userSelect,
  });
}

function createApiKey() {
  return `ag_${randomBytes(32).toString("hex")}`;
}
