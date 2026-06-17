# Zod Validation Schemas: Requirements Management

**Created**: 2026-06-17 | **Feature**: [spec.md](../spec.md)

These schemas are the single source of truth for validation. They are shared between the API routes (server-side) and Mantine forms (client-side).

---

## Enums

```typescript
export const REQUIREMENT_TYPE = {
  FUNCTIONAL: 'functional',
  NON_FUNCTIONAL: 'non_functional',
  TECHNICAL: 'technical',
  UX: 'ux',
} as const;

export type RequirementType = (typeof REQUIREMENT_TYPE)[keyof typeof REQUIREMENT_TYPE];

export const REQUIREMENT_PRIORITY = {
  P1: 'p1',
  P2: 'p2',
  P3: 'p3',
  P4: 'p4',
  P5: 'p5',
} as const;

export type RequirementPriority = (typeof REQUIREMENT_PRIORITY)[keyof typeof REQUIREMENT_PRIORITY];

export const REQUIREMENT_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  IMPLEMENTED: 'implemented',
  DEFERRED: 'deferred',
} as const;

export type RequirementStatus = (typeof REQUIREMENT_STATUS)[keyof typeof REQUIREMENT_STATUS];
```

## Status Transition Map

```typescript
export const ALLOWED_TRANSITIONS: Record<RequirementStatus, RequirementStatus[]> = {
  draft: ['approved', 'deferred'],
  approved: ['implemented', 'draft'],
  implemented: ['draft'],
  deferred: ['draft'],
};
```

---

## Schemas

### `requirementTypeSchema`

```typescript
import { z } from 'zod';

export const requirementTypeSchema = z.enum([
  'functional',
  'non_functional',
  'technical',
  'ux',
]);
```

### `requirementPrioritySchema`

```typescript
export const requirementPrioritySchema = z.enum([
  'p1',
  'p2',
  'p3',
  'p4',
  'p5',
]);
```

### `requirementStatusSchema`

```typescript
export const requirementStatusSchema = z.enum([
  'draft',
  'approved',
  'implemented',
  'deferred',
]);
```

### `createRequirementSchema`

Used by: `POST /api/projects/:projectId/requirements`

```typescript
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
```

### `updateRequirementSchema`

Used by: `PATCH /api/projects/:projectId/requirements/:requirementId`

```typescript
export const updateRequirementSchema = z.object({
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
  // Optimistic locking: client sends the updated_at it last read
  updated_at: z.string().datetime(),
}).refine(
  (data) =>
    data.title !== undefined ||
    data.description !== undefined ||
    data.type !== undefined ||
    data.priority !== undefined ||
    data.status !== undefined,
  { message: 'At least one field must be provided for update' }
);

export type UpdateRequirementInput = z.infer<typeof updateRequirementSchema>;
```

### `requirementListQuerySchema`

Used by: `GET /api/projects/:projectId/requirements`

```typescript
export const requirementListQuerySchema = z.object({
  search: z.string().optional(),
  type: requirementTypeSchema.optional(),
  priority: requirementPrioritySchema.optional(),
  status: requirementStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type RequirementListQuery = z.infer<typeof requirementListQuerySchema>;
```

### `requirementResponseSchema`

The shape returned by all requirement endpoints.

```typescript
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
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});

export type RequirementResponse = z.infer<typeof requirementResponseSchema>;
```

### `requirementListResponseSchema`

Paginated list wrapper.

```typescript
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
```

---

## Status-Transition Validation

Server-side logic for validating status transitions:

```typescript
export function validateRequirementStatusTransition(
  currentStatus: RequirementStatus,
  newStatus: RequirementStatus,
): { valid: true } | { valid: false; message: string } {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed) {
    return { valid: false, message: `Unknown status: ${currentStatus}` };
  }

  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowed.join(', ')}.`,
    };
  }

  return { valid: true };
}
```

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `INVALID_TRANSITION` | 400 | Status transition not allowed |
| `PROJECT_ARCHIVED` | 400 | Cannot modify requirements in an archived project |
| `CONFLICT` | 409 | Optimistic lock failure — requirement was modified |
| `NOT_FOUND` | 404 | Requirement does not exist or user is not owner |
| `UNAUTHORIZED` | 401 | User is not authenticated |
