import type { Requirement } from '@/lib/types/requirement';
import type { RequirementType, RequirementPriority, RequirementStatus } from '@/lib/constants/requirement';

interface RequirementRow {
  id: unknown;
  project_id: unknown;
  title: unknown;
  description: unknown;
  type: unknown;
  priority: unknown;
  status: unknown;
  owner_id: unknown;
  created_at: unknown;
  updated_at: unknown;
  deleted_at: unknown;
}

/**
 * Build the canonical requirement response object from a Supabase row.
 * All API routes that return requirement data should use this to keep
 * the response shape consistent and avoid duplication.
 */
export function buildRequirementResponse(row: RequirementRow): Requirement {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    title: row.title as string,
    description: row.description as string,
    type: row.type as RequirementType,
    priority: row.priority as RequirementPriority,
    status: row.status as RequirementStatus,
    owner_id: row.owner_id as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    deleted_at: (row.deleted_at as string | null) ?? null,
  };
}
