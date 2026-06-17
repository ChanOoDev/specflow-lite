'use client';

import { useQuery } from '@tanstack/react-query';
import type { SpecificationWithLinks } from '@/lib/types/specification';

async function fetchSpecification(
  projectId: string,
  specificationId: string
): Promise<SpecificationWithLinks> {
  const res = await fetch(
    `/api/projects/${projectId}/specifications/${specificationId}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Specification not found');
  }
  return res.json();
}

export function useSpecification(
  projectId: string | undefined,
  specificationId: string | undefined
) {
  return useQuery({
    queryKey: [
      'projects',
      projectId,
      'specifications',
      specificationId,
    ],
    queryFn: () => fetchSpecification(projectId!, specificationId!),
    enabled: !!projectId && !!specificationId,
  });
}
