'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { TaskListResponse, TaskListQueryParams } from '@/lib/types/task';

async function fetchTasks(
  projectId: string,
  specificationId: string,
  params: TaskListQueryParams
): Promise<TaskListResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const res = await fetch(
    `/api/projects/${projectId}/specifications/${specificationId}/tasks?${searchParams.toString()}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to fetch tasks');
  }
  return res.json();
}

export function useTasks(
  projectId: string,
  specificationId: string,
  params: TaskListQueryParams = {}
) {
  return useQuery({
    queryKey: ['projects', projectId, 'specifications', specificationId, 'tasks', params],
    queryFn: () => fetchTasks(projectId, specificationId, params),
    placeholderData: keepPreviousData,
    enabled: !!projectId && !!specificationId,
  });
}
