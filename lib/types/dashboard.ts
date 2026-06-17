import type { ProjectStatus } from '@/lib/constants/project';
import type { TaskStatus } from '@/lib/constants/task';

export interface TaskCountsByStatus {
  todo: number;
  in_progress: number;
  done: number;
}

export interface DashboardSummary {
  totalProjects: number;
  totalRequirements: number;
  totalSpecifications: number;
  tasksByStatus: TaskCountsByStatus;
}

export interface DashboardProject {
  id: string;
  name: string;
  status: ProjectStatus;
  counts: {
    requirements: number;
    specifications: number;
    tasks: number;
    completedTasks: number;
  };
}

export interface OpenTask {
  id: string;
  title: string;
  status: TaskStatus;
  projectId: string;
  specificationId: string;
  projectName: string;
  updatedAt: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  projects: DashboardProject[];
  openTasks: OpenTask[];
}

export interface RecentProject {
  projectId: string;
  projectName: string;
  lastAccessedAt: string;
}
