import type { SpecificationStatus } from '@/lib/constants/specification';
import type { Requirement } from './requirement';
import type { PaginationInfo } from './project';

export interface Specification {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: SpecificationStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Linked requirement data as returned from the detail endpoint */
export interface LinkedRequirement {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
}

export interface SpecificationWithLinks extends Specification {
  linked_requirements: LinkedRequirement[];
}

export interface SpecificationListQueryParams {
  search?: string;
  status?: SpecificationStatus;
  page?: number;
  pageSize?: number;
}

export interface SpecificationListResponse {
  data: Specification[];
  pagination: PaginationInfo;
}
