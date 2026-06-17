import { z } from 'zod/v4';

export const taskCountsByStatusSchema = z.object({
  todo: z.number().int().min(0),
  in_progress: z.number().int().min(0),
  done: z.number().int().min(0),
});

export const dashboardSummarySchema = z.object({
  totalProjects: z.number().int().min(0),
  totalRequirements: z.number().int().min(0),
  totalSpecifications: z.number().int().min(0),
  tasksByStatus: taskCountsByStatusSchema,
});

export const dashboardProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(['active', 'paused', 'completed', 'archived']),
  counts: z.object({
    requirements: z.number().int().min(0),
    specifications: z.number().int().min(0),
    tasks: z.number().int().min(0),
    completedTasks: z.number().int().min(0),
  }),
});

export const openTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.enum(['todo', 'in_progress']),
  projectId: z.string().uuid(),
  specificationId: z.string().uuid(),
  projectName: z.string(),
  updatedAt: z.string().datetime(),
});

export const dashboardResponseSchema = z.object({
  summary: dashboardSummarySchema,
  projects: z.array(dashboardProjectSchema),
  openTasks: z.array(openTaskSchema),
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
