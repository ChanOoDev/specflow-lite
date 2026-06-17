'use client';

import { useQuery } from '@tanstack/react-query';
import type { ProjectWithCounts } from '@/lib/types/project';

async function fetchProject(projectId: string): Promise<ProjectWithCounts> {
  const res = await fetch(`/api/projects/${projectId}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Project not found');
  }
  return res.json();
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  });
}
