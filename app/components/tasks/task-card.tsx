'use client';

import { Paper, Text, Group, Stack } from '@mantine/core';
import Link from 'next/link';
import { TaskStatusBadge } from './task-status-badge';
import type { Task } from '@/lib/types/task';

interface TaskCardProps {
  task: Task;
  projectId: string;
  specificationId: string;
}

export function TaskCard({
  task,
  projectId,
  specificationId,
}: TaskCardProps) {
  return (
    <Paper
      component={Link}
      href={`/projects/${projectId}/specifications/${specificationId}/tasks/${task.id}`}
      radius="md"
      p="md"
      withBorder
      style={{ textDecoration: 'none' }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Text size="xs" c="dimmed" style={{ minWidth: 24 }}>
            #{task.position}
          </Text>
          <Stack gap={2}>
            <Text size="sm" fw={500} lineClamp={1}>
              {task.title}
            </Text>
          </Stack>
        </Group>
        <TaskStatusBadge status={task.status} />
      </Group>
    </Paper>
  );
}
