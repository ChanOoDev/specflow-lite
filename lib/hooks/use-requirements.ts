'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { RequirementListResponse, RequirementListQueryParams } from '@/lib/types/requirement';

async function fetchRequirements(
  projectId: string,
  params: RequirementListQueryParams
): Promise<RequirementListResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.type) searchParams.set('type', params.type);
  if (params.priority) searchParams.set('priority', params.priority);
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const res = await fetch(
    `/api/projects/${projectId}/requirements?${searchParams.toString()}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to fetch requirements');
  }
  return res.json();
}

export function useRequirements(projectId: string, params: RequirementListQueryParams = {}) {
  return useQuery({
    queryKey: ['projects', projectId, 'requirements', params],
    queryFn: () => fetchRequirements(projectId, params),
    placeholderData: keepPreviousData,
    enabled: !!projectId,
  });
}
