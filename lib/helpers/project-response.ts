import type { ProjectWithCounts, ProjectCounts } from '@/lib/types/project';
import type { ProjectStatus } from '@/lib/constants/project';

interface ProjectRow {
  id: unknown;
  name: unknown;
  description: unknown;
  status: unknown;
  owner_id: unknown;
  created_at: unknown;
  updated_at: unknown;
  archived_at: unknown;
}

const EMPTY_COUNTS: ProjectCounts = {
  requirements: 0,
  specifications: 0,
  tasks: 0,
  completedTasks: 0,
};

/**
 * Build the canonical project response object from a Supabase row.
 * All API routes that return project data should use this to keep
 * the response shape consistent and avoid duplication.
 *
 * Counts can be provided for individual fields; any missing count
 * defaults to 0 so existing callers don't need to change.
 */
export function buildProjectResponse(
  row: ProjectRow,
  counts: Partial<ProjectCounts> = {}
): ProjectWithCounts {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    status: row.status as ProjectStatus,
    owner_id: row.owner_id as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    archived_at: (row.archived_at as string | null) ?? null,
    counts: {
      ...EMPTY_COUNTS,
      ...counts,
    },
  };
}
