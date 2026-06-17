'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type {
  SpecificationListResponse,
  SpecificationListQueryParams,
} from '@/lib/types/specification';

async function fetchSpecifications(
  projectId: string,
  params: SpecificationListQueryParams
): Promise<SpecificationListResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  const res = await fetch(
    `/api/projects/${projectId}/specifications?${searchParams.toString()}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to fetch specifications');
  }
  return res.json();
}

export function useSpecifications(
  projectId: string,
  params: SpecificationListQueryParams = {}
) {
  return useQuery({
    queryKey: ['projects', projectId, 'specifications', params],
    queryFn: () => fetchSpecifications(projectId, params),
    placeholderData: keepPreviousData,
    enabled: !!projectId,
  });
}
