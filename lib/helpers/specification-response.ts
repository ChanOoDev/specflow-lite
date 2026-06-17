import type { Specification } from '@/lib/types/specification';
import type { SpecificationStatus } from '@/lib/constants/specification';

interface SpecificationRow {
  id: unknown;
  project_id: unknown;
  title: unknown;
  description: unknown;
  status: unknown;
  owner_id: unknown;
  created_at: unknown;
  updated_at: unknown;
  deleted_at: unknown;
}

/**
 * Build the canonical specification response object from a Supabase row.
 * All API routes that return specification data should use this to keep
 * the response shape consistent and avoid duplication.
 */
export function buildSpecificationResponse(row: SpecificationRow): Specification {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as SpecificationStatus,
    owner_id: row.owner_id as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    deleted_at: (row.deleted_at as string | null) ?? null,
  };
}
