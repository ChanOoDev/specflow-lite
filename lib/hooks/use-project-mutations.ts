'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { ProjectWithCounts } from '@/lib/types/project';

async function createProject(data: { name: string; description?: string }): Promise<ProjectWithCounts> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to create project');
  return body;
}

async function updateProject(projectId: string, data: Record<string, unknown>): Promise<ProjectWithCounts> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to update project');
  return body;
}

async function archiveProject(projectId: string): Promise<ProjectWithCounts> {
  const res = await fetch(`/api/projects/${projectId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'archive' }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to archive project');
  return body;
}

async function restoreProject(projectId: string): Promise<ProjectWithCounts> {
  const res = await fetch(`/api/projects/${projectId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'restore' }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to restore project');
  return body;
}

async function deleteProject(projectId: string): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to delete project');
  }
}

export function useCreateProject() {
  const router = useRouter();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      router.push(`/projects/${data.id}`);
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveProject,
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previous = queryClient.getQueryData<{ data: ProjectWithCounts[] }>(['projects']);
      queryClient.setQueryData<{ data: ProjectWithCounts[] }>(['projects'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((p) =>
            p.id === projectId ? { ...p, status: 'archived' as const } : p
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _projectId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['projects'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreProject,
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previous = queryClient.getQueryData<{ data: ProjectWithCounts[] }>(['projects']);
      queryClient.setQueryData<{ data: ProjectWithCounts[] }>(['projects'], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((p) =>
            p.id === projectId ? { ...p, status: 'active' as const } : p
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _projectId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['projects'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/projects');
    },
  });
}
