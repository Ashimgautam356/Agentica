import { ApiError } from "../errors/api-error";
import { prisma } from "../prisma";
import type { CreateTestimonialInput } from "../schemas/testimonial.schema";

const publicTestimonialSelect = {
  id: true,
  fullName: true,
  message: true,
  createdAt: true,
} as const;

export function listTestimonials() {
  return prisma.testimonial.findMany({
    select: publicTestimonialSelect,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export function getMyTestimonial(userId: string) {
  return prisma.testimonial.findFirst({
    where: { userId },
    select: publicTestimonialSelect,
  });
}

export async function createTestimonial(userId: string, data: CreateTestimonialInput) {
  const customer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      emailVerifiedAt: true,
      testimonial: { select: { id: true } },
    },
  });

  if (!customer?.emailVerifiedAt) {
    throw new ApiError("FORBIDDEN", "Verify your email before submitting a testimonial.");
  }

  if (!customer.email) {
    throw new ApiError("BAD_REQUEST", "Your account does not have an email address.");
  }

  if (customer.testimonial) {
    throw new ApiError("CONFLICT", "You have already submitted a testimonial.");
  }

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  if (!fullName) {
    throw new ApiError("BAD_REQUEST", "Add your full name to your profile first.");
  }

  return prisma.testimonial.create({
    data: { userId, email: customer.email, fullName, message: data.message },
    select: publicTestimonialSelect,
  });
}
