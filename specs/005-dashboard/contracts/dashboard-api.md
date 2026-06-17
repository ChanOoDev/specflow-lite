# API Contract: Dashboard

**Endpoint**: `GET /api/dashboard`

## Request

No query parameters. Authentication via Supabase session cookie.

## Response

### 200 OK

```json
{
  "summary": {
    "totalProjects": 5,
    "totalRequirements": 23,
    "totalSpecifications": 12,
    "tasksByStatus": {
      "todo": 8,
      "in_progress": 4,
      "done": 15
    }
  },
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name",
      "status": "active",
      "counts": {
        "requirements": 7,
        "specifications": 3,
        "tasks": 10,
        "completedTasks": 6
      }
    }
  ],
  "openTasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "status": "todo",
      "projectId": "uuid",
      "projectName": "Project Name",
      "updatedAt": "2026-06-18T00:00:00.000Z"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "UNAUTHORIZED"
}
```

### 500 Internal Error

```json
{
  "error": "INTERNAL_ERROR",
  "message": "Error description"
}
```

## Validation Rules (Zod)

```typescript
const dashboardResponseSchema = z.object({
  summary: z.object({
    totalProjects: z.number().int().min(0),
    totalRequirements: z.number().int().min(0),
    totalSpecifications: z.number().int().min(0),
    tasksByStatus: z.object({
      todo: z.number().int().min(0),
      in_progress: z.number().int().min(0),
      done: z.number().int().min(0),
    }),
  }),
  projects: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    status: z.enum(['active', 'paused', 'completed', 'archived']),
    counts: z.object({
      requirements: z.number().int().min(0),
      specifications: z.number().int().min(0),
      tasks: z.number().int().min(0),
      completedTasks: z.number().int().min(0),
    }),
  })),
  openTasks: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    status: z.enum(['todo', 'in_progress']),
    projectId: z.string().uuid(),
    projectName: z.string(),
    updatedAt: z.string().datetime(),
  })),
});
```
