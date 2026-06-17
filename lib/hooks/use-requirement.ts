'use client';

import { useQuery } from '@tanstack/react-query';
import type { Requirement } from '@/lib/types/requirement';

async function fetchRequirement(
  projectId: string,
  requirementId: string
): Promise<Requirement> {
  const res = await fetch(
    `/api/projects/${projectId}/requirements/${requirementId}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Requirement not found');
  }
  return res.json();
}

export function useRequirement(
  projectId: string | undefined,
  requirementId: string | undefined
) {
  return useQuery({
    queryKey: ['projects', projectId, 'requirements', requirementId],
    queryFn: () => fetchRequirement(projectId!, requirementId!),
    enabled: !!projectId && !!requirementId,
  });
}
