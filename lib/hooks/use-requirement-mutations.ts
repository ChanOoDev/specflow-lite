'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { Requirement } from '@/lib/types/requirement';

async function createRequirement(
  projectId: string,
  data: { title: string; description?: string; type: string; priority: string }
): Promise<Requirement> {
  const res = await fetch(`/api/projects/${projectId}/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to create requirement');
  return body;
}

async function updateRequirement(
  projectId: string,
  requirementId: string,
  data: Record<string, unknown>
): Promise<Requirement> {
  const res = await fetch(
    `/api/projects/${projectId}/requirements/${requirementId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to update requirement');
  return body;
}

async function deleteRequirement(
  projectId: string,
  requirementId: string
): Promise<void> {
  const res = await fetch(
    `/api/projects/${projectId}/requirements/${requirementId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to delete requirement');
  }
}

export function useCreateRequirement(projectId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      type: string;
      priority: string;
    }) => createRequirement(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'requirements'],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      router.push(`/projects/${projectId}/requirements`);
    },
  });
}

export function useUpdateRequirement(projectId: string, requirementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateRequirement(projectId, requirementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'requirements'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'requirements', requirementId],
      });
    },
  });
}

export function useDeleteRequirement(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requirementId: string) =>
      deleteRequirement(projectId, requirementId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'requirements'],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}
