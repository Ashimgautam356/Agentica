import { ApiError } from "../errors/api-error";
import { hashPassword } from "../lib/auth";
import { paginatedResult, type Pagination } from "../lib/pagination";
import { prisma } from "../prisma";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserPasswordInput,
} from "../schemas/user.schema";

const userSelect = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  imageId: true,
  age: true,
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

export function getUser(id: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id },
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

export function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export function updateUserPassword(id: string, data: UpdateUserPasswordInput) {
  return prisma.user.update({
    where: { id },
    data: {
      passwordHash: hashPassword(data.password),
    },
    select: userSelect,
  });
}

export function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
    select: userSelect,
  });
}

export async function deleteUserSession(userId: string, sessionId: string) {
  const result = await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (result.count === 0) {
    throw new ApiError("NOT_FOUND", "Session not found.");
  }
}

export function deleteAdmin(id: string) {
  return deleteUser(id);
}
