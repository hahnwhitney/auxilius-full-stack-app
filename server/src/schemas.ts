import { z } from "zod";
import { TaskStatus } from "./types.js";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const getTasksQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createUserSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
});
