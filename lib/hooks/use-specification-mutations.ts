'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { Specification, SpecificationWithLinks } from '@/lib/types/specification';

async function createSpecification(
  projectId: string,
  data: {
    title: string;
    description?: string;
    linked_requirement_ids?: string[];
  }
): Promise<Specification> {
  const res = await fetch(`/api/projects/${projectId}/specifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to create specification');
  return body;
}

async function updateSpecification(
  projectId: string,
  specificationId: string,
  data: Record<string, unknown>
): Promise<SpecificationWithLinks> {
  const res = await fetch(
    `/api/projects/${projectId}/specifications/${specificationId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to update specification');
  return body;
}

async function deleteSpecification(
  projectId: string,
  specificationId: string
): Promise<void> {
  const res = await fetch(
    `/api/projects/${projectId}/specifications/${specificationId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to delete specification');
  }
}

export function useCreateSpecification(projectId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      linked_requirement_ids?: string[];
    }) => createSpecification(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications'],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      router.push(`/projects/${projectId}/specifications`);
    },
  });
}

export function useUpdateSpecification(
  projectId: string,
  specificationId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateSpecification(projectId, specificationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'projects',
          projectId,
          'specifications',
          specificationId,
        ],
      });
    },
  });
}

export function useDeleteSpecification(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (specificationId: string) =>
      deleteSpecification(projectId, specificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications'],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}
