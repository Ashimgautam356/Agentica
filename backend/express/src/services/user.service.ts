import { randomBytes, scryptSync } from "node:crypto";
import { prisma } from "../prisma";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserPasswordInput,
} from "../schemas/user.schema";

const userSelect = {
  id: true,
  email: true,
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

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function listUsers() {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
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

export function deleteUserSession(userId: string, sessionId: string) {
  return prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId,
    },
  });
}

export function deleteAdmin(id: string) {
  return deleteUser(id);
}
