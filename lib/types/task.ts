import type { TaskStatus } from '@/lib/constants/task';
import type { PaginationInfo } from './project';

export interface Task {
  id: string;
  specification_id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TaskWithSpec extends Task {
  specification_title: string;
}

export interface TaskListQueryParams {
  search?: string;
  status?: TaskStatus;
  page?: number;
  pageSize?: number;
}

export interface TaskListResponse {
  data: Task[];
  pagination: PaginationInfo;
}
