'use client';

import { useQuery } from '@tanstack/react-query';
import type { TaskWithSpec } from '@/lib/types/task';

async function fetchTask(
  projectId: string,
  specificationId: string,
  taskId: string
): Promise<TaskWithSpec> {
  const res = await fetch(
    `/api/projects/${projectId}/specifications/${specificationId}/tasks/${taskId}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to fetch task');
  }
  return res.json();
}

export function useTask(
  projectId: string,
  specificationId: string,
  taskId: string
) {
  return useQuery({
    queryKey: ['projects', projectId, 'specifications', specificationId, 'tasks', taskId],
    queryFn: () => fetchTask(projectId, specificationId, taskId),
    enabled: !!projectId && !!specificationId && !!taskId,
  });
}
