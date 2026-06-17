import type { RequirementType, RequirementPriority, RequirementStatus } from '@/lib/constants/requirement';

export interface Requirement {
  id: string;
  project_id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RequirementListQueryParams {
  search?: string;
  type?: RequirementType;
  priority?: RequirementPriority;
  status?: RequirementStatus;
  page?: number;
  pageSize?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface RequirementListResponse {
  data: Requirement[];
  pagination: PaginationInfo;
}
