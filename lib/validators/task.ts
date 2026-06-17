import { z } from 'zod/v4';

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done']);

export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Title is required' })
    .max(200, { error: 'Title must be 200 characters or fewer' }),
  description: z
    .string()
    .max(5000, { error: 'Description must be 5000 characters or fewer' })
    .default(''),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { error: 'Title is required' })
      .max(200, { error: 'Title must be 200 characters or fewer' })
      .optional(),
    description: z
      .string()
      .max(5000, { error: 'Description must be 5000 characters or fewer' })
      .optional(),
    status: taskStatusSchema.optional(),
    position: z.number().int().min(1).optional(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined ||
      data.position !== undefined,
    { message: 'At least one field must be provided for update' }
  );

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskListQuerySchema = z.object({
  search: z.string().optional(),
  status: taskStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type TaskListQuery = z.infer<typeof taskListQuerySchema>;

export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  specification_id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  position: z.number().int(),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime({ offset: true }),
  deleted_at: z.string().datetime().nullable(),
});

export type TaskResponse = z.infer<typeof taskResponseSchema>;

export const taskListResponseSchema = z.object({
  data: z.array(taskResponseSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(50),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export type TaskListResponse = z.infer<typeof taskListResponseSchema>;

// Status transition validation
export function validateTaskStatusTransition(
  currentStatus: string,
  newStatus: string
): { valid: true } | { valid: false; message: string } {
  const allowed: Record<string, string[]> = {
    todo: ['in_progress'],
    in_progress: ['done', 'todo'],
    done: ['in_progress'],
  };

  const allowedTransitions = allowed[currentStatus];

  if (!allowedTransitions) {
    return { valid: false, message: `Unknown status: ${currentStatus}` };
  }

  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedTransitions.join(', ') || 'none'}.`,
    };
  }

  return { valid: true };
}
