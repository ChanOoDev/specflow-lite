'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import type { Task, TaskWithSpec } from '@/lib/types/task';

async function createTask(
  projectId: string,
  specificationId: string,
  data: { title: string; description?: string }
): Promise<Task> {
  const res = await fetch(
    `/api/projects/${projectId}/specifications/${specificationId}/tasks`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to create task');
  return body;
}

async function updateTask(
  projectId: string,
  specificationId: string,
  taskId: string,
  data: Record<string, unknown>
): Promise<TaskWithSpec> {
  const res = await fetch(
    `/api/projects/${projectId}/specifications/${specificationId}/tasks/${taskId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Failed to update task');
  return body;
}

async function deleteTask(
  projectId: string,
  specificationId: string,
  taskId: string
): Promise<void> {
  const res = await fetch(
    `/api/projects/${projectId}/specifications/${specificationId}/tasks/${taskId}`,
    { method: 'DELETE' }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to delete task');
  }
}

export function useCreateTask(projectId: string, specificationId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      createTask(projectId, specificationId, data),
    onSuccess: (data) => {
      notifications.show({ title: 'Task created', message: `"${data.title}" has been created successfully.`, color: 'green' });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications', specificationId, 'tasks'],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications', specificationId],
      });
      router.push(
        `/projects/${projectId}/specifications/${specificationId}/tasks`
      );
    },
    onError: (error) => {
      notifications.show({ title: 'Failed to create task', message: error.message, color: 'red' });
    },
  });
}

export function useUpdateTask(
  projectId: string,
  specificationId: string,
  taskId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateTask(projectId, specificationId, taskId, data),
    onSuccess: () => {
      notifications.show({ title: 'Task updated', message: 'Task has been updated successfully.', color: 'green' });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications', specificationId, 'tasks'],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'projects',
          projectId,
          'specifications',
          specificationId,
          'tasks',
          taskId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications', specificationId],
      });
    },
    onError: (error) => {
      notifications.show({ title: 'Failed to update task', message: error.message, color: 'red' });
    },
  });
}

export function useDeleteTask(projectId: string, specificationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      deleteTask(projectId, specificationId, taskId),
    onSuccess: () => {
      notifications.show({ title: 'Task deleted', message: 'Task has been deleted successfully.', color: 'green' });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications', specificationId, 'tasks'],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'specifications', specificationId],
      });
    },
    onError: (error) => {
      notifications.show({ title: 'Failed to delete task', message: error.message, color: 'red' });
    },
  });
}
