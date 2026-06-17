'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { ProjectListResponse, ProjectListQueryParams } from '@/lib/types/project';

async function fetchProjects(params: ProjectListQueryParams): Promise<ProjectListResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.includeArchived) searchParams.set('includeArchived', 'true');

  const res = await fetch(`/api/projects?${searchParams.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to fetch projects');
  }
  return res.json();
}

export function useProjects(params: ProjectListQueryParams = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => fetchProjects(params),
    placeholderData: keepPreviousData,
  });
}
