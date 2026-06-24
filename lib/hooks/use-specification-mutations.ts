'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
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
    onSuccess: (data) => {
      notifications.show({ title: 'Specification created', message: `"${data.title}" has been created successfully.`, color: 'green' });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications'],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      router.push(`/projects/${projectId}/specifications`);
    },
    onError: (error) => {
      notifications.show({ title: 'Failed to create specification', message: error.message, color: 'red' });
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
      notifications.show({ title: 'Specification updated', message: 'Specification has been updated successfully.', color: 'green' });
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
    onError: (error) => {
      notifications.show({ title: 'Failed to update specification', message: error.message, color: 'red' });
    },
  });
}

export function useDeleteSpecification(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (specificationId: string) =>
      deleteSpecification(projectId, specificationId),
    onSuccess: () => {
      notifications.show({ title: 'Specification deleted', message: 'Specification has been deleted successfully.', color: 'green' });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications'],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
    onError: (error) => {
      notifications.show({ title: 'Failed to delete specification', message: error.message, color: 'red' });
    },
  });
}
