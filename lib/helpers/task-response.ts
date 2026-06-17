import type { Task } from '@/lib/types/task';
import type { TaskStatus } from '@/lib/constants/task';

interface TaskRow {
  id: unknown;
  specification_id: unknown;
  project_id: unknown;
  title: unknown;
  description: unknown;
  status: unknown;
  position: unknown;
  owner_id: unknown;
  created_at: unknown;
  updated_at: unknown;
  deleted_at: unknown;
}

/**
 * Build the canonical task response object from a Supabase row.
 * All API routes that return task data should use this to keep
 * the response shape consistent and avoid duplication.
 */
export function buildTaskResponse(row: TaskRow): Task {
  return {
    id: row.id as string,
    specification_id: row.specification_id as string,
    project_id: row.project_id as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as TaskStatus,
    position: row.position as number,
    owner_id: row.owner_id as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    deleted_at: (row.deleted_at as string | null) ?? null,
  };
}
