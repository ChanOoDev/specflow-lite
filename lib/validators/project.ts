import { z } from 'zod/v4';

export const projectStatusSchema = z.enum([
  'active',
  'paused',
  'completed',
  'archived',
]);

export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Project name is required' })
    .max(120, { error: 'Project name must be 120 characters or fewer' }),
  description: z
    .string()
    .max(2000, { error: 'Description must be 2000 characters or fewer' })
    .default(''),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'Project name is required' })
      .max(120, { error: 'Project name must be 120 characters or fewer' })
      .optional(),
    description: z
      .string()
      .max(2000, { error: 'Description must be 2000 characters or fewer' })
      .optional(),
    status: projectStatusSchema.optional(),
    updated_at: z.string().datetime(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.status !== undefined,
    { message: 'At least one field must be provided for update' }
  );

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectListQuerySchema = z.object({
  search: z.string().optional(),
  status: projectStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  includeArchived: z.coerce.boolean().default(false),
});

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  status: projectStatusSchema,
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  archived_at: z.string().datetime().nullable(),
  counts: z.object({
    requirements: z.number().int().min(0),
    specifications: z.number().int().min(0),
    tasks: z.number().int().min(0),
    completedTasks: z.number().int().min(0),
  }),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;

export const projectListResponseSchema = z.object({
  data: z.array(projectResponseSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(50),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;

export const validationErrorSchema = z.object({
  error: z.literal('VALIDATION_ERROR'),
  message: z.string(),
  details: z.record(z.string(), z.array(z.string())),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;

// Status transition validation
export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): { valid: true } | { valid: false; message: string } {
  const allowed: Record<string, string[]> = {
    active: ['paused', 'completed', 'archived'],
    paused: ['active', 'archived'],
    completed: ['archived'],
    archived: ['active'],
  };

  const allowedTransitions = allowed[currentStatus];

  if (!allowedTransitions) {
    return { valid: false, message: `Unknown status: ${currentStatus}` };
  }

  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedTransitions.join(', ')}.`,
    };
  }

  return { valid: true };
}
