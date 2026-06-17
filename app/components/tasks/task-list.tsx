'use client';

import { Stack, TextInput, Select, SimpleGrid, Skeleton } from '@mantine/core';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TaskCard } from './task-card';
import { TaskEmptyState } from './task-empty-state';
import { useTasks } from '@/lib/hooks/use-tasks';
import type { TaskStatus } from '@/lib/constants/task';

interface TaskListProps {
  projectId: string;
  specificationId: string;
}

export function TaskList({ projectId, specificationId }: TaskListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState<TaskStatus | undefined>(
    (searchParams.get('status') as TaskStatus) || undefined
  );
  const [page, setPage] = useState(
    Number(searchParams.get('page')) || 1
  );

  const { data, isLoading, isError, error } = useTasks(
    projectId,
    specificationId,
    { search, status, page }
  );

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '', { scroll: false });
  }, [search, status, page, router]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  if (isLoading) {
    return (
      <Stack gap="sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={60} radius="md" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <TaskEmptyState
        projectId={projectId}
        specificationId={specificationId}
      />
    );
  }

  const tasks = data?.data ?? [];
  const pagination = data?.pagination;

  if (tasks.length === 0 && !search && !status) {
    return (
      <TaskEmptyState
        projectId={projectId}
        specificationId={specificationId}
      />
    );
  }

  return (
    <Stack gap="sm">
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <TextInput
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
        />
        <Select
          placeholder="Filter by status"
          value={status ?? ''}
          onChange={(value) => {
            setStatus((value as TaskStatus) || undefined);
            setPage(1);
          }}
          data={[
            { value: 'todo', label: 'Todo' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
          ]}
          clearable
        />
      </SimpleGrid>

      {tasks.length === 0 ? (
        <TaskEmptyState
          projectId={projectId}
          specificationId={specificationId}
        />
      ) : (
        <Stack gap="sm">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectId={projectId}
              specificationId={specificationId}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
