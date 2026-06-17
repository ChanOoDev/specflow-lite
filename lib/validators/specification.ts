import { z } from 'zod/v4';

export const specificationStatusSchema = z.enum([
  'draft',
  'in_progress',
  'completed',
  'approved',
  'archived',
]);

export type SpecificationStatus = z.infer<typeof specificationStatusSchema>;

export const createSpecificationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Title is required' })
    .max(200, { error: 'Title must be 200 characters or fewer' }),
  description: z
    .string()
    .max(5000, { error: 'Description must be 5000 characters or fewer' })
    .default(''),
  linked_requirement_ids: z
    .array(z.string().uuid())
    .max(50, { error: 'Cannot link more than 50 requirements' })
    .optional()
    .default([]),
});

export type CreateSpecificationInput = z.infer<typeof createSpecificationSchema>;

export const updateSpecificationSchema = z
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
    status: specificationStatusSchema.optional(),
    linked_requirement_ids: z
      .array(z.string().uuid())
      .max(50, { error: 'Cannot link more than 50 requirements' })
      .optional(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined ||
      data.linked_requirement_ids !== undefined,
    { message: 'At least one field must be provided for update' }
  );

export type UpdateSpecificationInput = z.infer<typeof updateSpecificationSchema>;

export const specificationListQuerySchema = z.object({
  search: z.string().optional(),
  status: specificationStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type SpecificationListQuery = z.infer<typeof specificationListQuerySchema>;

export const specificationResponseSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: specificationStatusSchema,
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime({ offset: true }),
  deleted_at: z.string().datetime().nullable(),
});

export type SpecificationResponse = z.infer<typeof specificationResponseSchema>;

export const linkedRequirementSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: z.string(),
  priority: z.string(),
  status: z.string(),
});

export type LinkedRequirement = z.infer<typeof linkedRequirementSchema>;

export const specificationDetailResponseSchema = specificationResponseSchema.extend({
  linked_requirements: z.array(linkedRequirementSchema),
});

export const specificationListResponseSchema = z.object({
  data: z.array(specificationResponseSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(50),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

export type SpecificationListResponse = z.infer<
  typeof specificationListResponseSchema
>;

// Status transition validation
export function validateSpecificationStatusTransition(
  currentStatus: string,
  newStatus: string
): { valid: true } | { valid: false; message: string } {
  const allowed: Record<string, string[]> = {
    draft: ['in_progress', 'archived'],
    in_progress: ['completed', 'draft'],
    completed: ['approved', 'draft'],
    approved: [],
    archived: ['draft'],
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
