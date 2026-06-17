import type { ProjectStatus } from '@/lib/constants/project';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface ProjectCounts {
  requirements: number;
  specifications: number;
  tasks: number;
  completedTasks: number;
}

export interface ProjectWithCounts extends Project {
  counts: ProjectCounts;
}

export interface ProjectListQueryParams {
  search?: string;
  status?: ProjectStatus;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponse {
  data: ProjectWithCounts[];
  pagination: PaginationInfo;
}
