import type { RequestHandler } from "express";
import { asyncHandler } from "../middleware/async-handler";
import * as userService from "../services/user.service";

export const listUsers: RequestHandler = asyncHandler(async (_request, response) => {
  const users = await userService.listUsers();

  response.json({ success: true, data: users });
});

export const getUser: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.getUser(request.params.id as string);

  response.json({ success: true, data: user });
});

export const createUser: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.createUser(request.body);

  response.status(201).json({ success: true, data: user });
});

export const updateUser: RequestHandler = asyncHandler(async (request, response) => {
  const user = await userService.updateUser(request.params.id as string, request.body);

  response.json({ success: true, data: user });
});

export const deleteUser: RequestHandler = asyncHandler(async (request, response) => {
  await userService.deleteUser(request.params.id as string);

  response.status(204).send();
});

export const deleteAdmin: RequestHandler = asyncHandler(async (request, response) => {
  await userService.deleteAdmin(request.params.id as string);

  response.status(204).send();
});
