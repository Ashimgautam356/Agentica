import type { RequestHandler } from "express";
import { getPagination } from "../lib/pagination";
import { asyncHandler } from "../middleware/async-handler";
import * as userService from "../services/user.service";

export const listUsers: RequestHandler = asyncHandler(async (request, response) => {
  const users = await userService.listUsers(getPagination(request.query));

  response.json({ success: true, data: users });
});

export const listCustomers: RequestHandler = asyncHandler(async (request, response) => {
  const customers = await userService.listCustomers(getPagination(request.query));

  response.json({ success: true, data: customers });
});

export const listAdmins: RequestHandler = asyncHandler(async (request, response) => {
  const admins = await userService.listAdmins(getPagination(request.query));

  response.json({ success: true, data: admins });
});

export const getUser: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.getUser(request.params.id as string);

  response.json({ success: true, data: user });
});

export const getCustomer: RequestHandler = asyncHandler(async (request, response) => {
  const customer = await userService.getCustomer(request.params.id as string);

  response.json({ success: true, data: customer });
});

export const createUser: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.createUser(request.body);

  response.status(201).json({ success: true, data: user });
});

export const updateUser: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.updateCustomer(request.params.id as string, request.body);

  response.json({ success: true, data: user });
});

export const updateUserPassword: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.updateCustomerPassword(request.params.id as string, request.body);

  response.json({ success: true, data: user });
});

export const disableUserApiKey: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.disableCustomerApiKey(request.params.id as string);

  response.json({ success: true, data: user });
});

export const regenerateMyApiKey: RequestHandler = asyncHandler(async (_request, response) => {
  const user = await userService.regenerateCustomerApiKey(response.locals.customer.id);

  response.json({ success: true, data: user });
});

export const updateMyPassword: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.updateMyPassword(response.locals.customer.id, request.body);

  response.json({ success: true, data: user });
});

export const deleteUser: RequestHandler = asyncHandler(async (request, response) => {
  await userService.deleteCustomer(request.params.id as string);

  response.status(204).send();
});

export const deleteUserSession: RequestHandler = asyncHandler(async (request, response) => {
  await userService.deleteCustomerSession(
    request.params.id as string,
    request.params.sessionId as string,
  );

  response.status(204).send();
});

export const deleteAdmin: RequestHandler = asyncHandler(async (request, response) => {
  await userService.deleteAdmin(request.params.id as string);

  response.status(204).send();
});

export const updateAdmin: RequestHandler = asyncHandler(async (request, response) => {
  const admin = await userService.updateAdmin(request.params.id as string, request.body);

  response.json({ success: true, data: admin });
});
