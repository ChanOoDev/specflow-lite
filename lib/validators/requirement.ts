import { z } from 'zod/v4';

export const requirementTypeSchema = z.enum([
  'functional',
  'non_functional',
  'technical',
  'ux',
]);

export type RequirementType = z.infer<typeof requirementTypeSchema>;

export const requirementPrioritySchema = z.enum([
  'p1',
  'p2',
  'p3',
  'p4',
  'p5',
]);

export type RequirementPriority = z.infer<typeof requirementPrioritySchema>;

export const requirementStatusSchema = z.enum([
  'draft',
  'approved',
  'implemented',
  'deferred',
]);

export type RequirementStatus = z.infer<typeof requirementStatusSchema>;

export const createRequirementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Title is required' })
    .max(200, { error: 'Title must be 200 characters or fewer' }),
  description: z
    .string()
    .max(3000, { error: 'Description must be 3000 characters or fewer' })
    .default(''),
  type: requirementTypeSchema,
  priority: requirementPrioritySchema,
});

export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;

export const updateRequirementSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { error: 'Title is required' })
      .max(200, { error: 'Title must be 200 characters or fewer' })
      .optional(),
    description: z
      .string()
      .max(3000, { error: 'Description must be 3000 characters or fewer' })
      .optional(),
    type: requirementTypeSchema.optional(),
    priority: requirementPrioritySchema.optional(),
    status: requirementStatusSchema.optional(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.type !== undefined ||
      data.priority !== undefined ||
      data.status !== undefined,
    { message: 'At least one field must be provided for update' }
  );

export type UpdateRequirementInput = z.infer<typeof updateRequirementSchema>;

export const requirementListQuerySchema = z.object({
  search: z.string().optional(),
  type: requirementTypeSchema.optional(),
  priority: requirementPrioritySchema.optional(),
  status: requirementStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type RequirementListQuery = z.infer<typeof requirementListQuerySchema>;

export const requirementResponseSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  type: requirementTypeSchema,
  priority: requirementPrioritySchema,
  status: requirementStatusSchema,
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime({ offset: true }),
  deleted_at: z.string().datetime().nullable(),
});

export type RequirementResponse = z.infer<typeof requirementResponseSchema>;

export const requirementListResponseSchema = z.object({
  data: z.array(requirementResponseSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(50),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export type RequirementListResponse = z.infer<typeof requirementListResponseSchema>;

// Status transition validation
export function validateRequirementStatusTransition(
  currentStatus: string,
  newStatus: string
): { valid: true } | { valid: false; message: string } {
  const allowed: Record<string, string[]> = {
    draft: ['approved', 'deferred'],
    approved: ['implemented', 'draft'],
    implemented: ['draft'],
    deferred: ['draft'],
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
