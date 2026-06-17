# Zod Validation Schemas: Project Management

**Created**: 2026-06-15 | **Feature**: [spec.md](../spec.md)

These schemas are the single source of truth for validation. They are shared between the API routes (server-side) and Mantine forms (client-side).

---

## Enums

```typescript
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];
```

## Status Transition Map

```typescript
export const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  active: ['paused', 'completed', 'archived'],
  paused: ['active', 'archived'],
  completed: ['archived'],
  archived: ['active'],
};
```

---

## Schemas

### `createProjectSchema`

Used by: `POST /api/projects`

```typescript
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(120, 'Project name must be 120 characters or fewer'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .default(''),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

### `updateProjectSchema`

Used by: `PATCH /api/projects/:id`

```typescript
export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(120, 'Project name must be 120 characters or fewer')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional(),
  status: z
    .enum(['active', 'paused', 'completed', 'archived'])
    .optional(),
  // Optimistic locking: client sends the updated_at it last read
  updated_at: z.string().datetime(),
}).refine(
  (data) => data.name !== undefined || data.description !== undefined || data.status !== undefined,
  { message: 'At least one field must be provided for update' }
);

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

### `projectListQuerySchema`

Used by: `GET /api/projects`

```typescript
export const projectListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  // Special filter to include archived projects (default: false)
  includeArchived: z.coerce.boolean().default(false),
});

export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
```

### `projectResponseSchema`

The shape returned by all project endpoints.

```typescript
export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['active', 'paused', 'completed', 'archived']),
  owner_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  archived_at: z.string().datetime().nullable(),
  // Computed fields
  counts: z.object({
    requirements: z.number().int().min(0),
    specifications: z.number().int().min(0),
    tasks: z.number().int().min(0),
    completedTasks: z.number().int().min(0),
  }),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;
```

### `projectListResponseSchema`

Paginated list wrapper.

```typescript
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
```

---

## Validation Error Format

All validation errors follow this structure, consistent across the API:

```typescript
export const validationErrorSchema = z.object({
  error: z.literal('VALIDATION_ERROR'),
  message: z.string(),
  details: z.record(z.string(), z.array(z.string())), // field → error messages
});

export type ValidationError = z.infer<typeof validationErrorSchema>;
```

## Status-Transition Validation

Server-side logic for validating status transitions:

```typescript
export function validateStatusTransition(
  currentStatus: ProjectStatus,
  newStatus: ProjectStatus,
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
| `NAME_DUPLICATE` | 409 | Project name already exists for this owner |
| `INVALID_TRANSITION` | 400 | Status transition not allowed |
| `CONFLICT` | 409 | Optimistic lock failure — project was modified |
| `PROJECT_ARCHIVED` | 400 | Cannot modify an archived project |
| `PROJECT_DELETED` | 404 | Project is soft-deleted |
| `NOT_FOUND` | 404 | Project does not exist or user is not owner |
| `UNAUTHORIZED` | 401 | User is not authenticated |
