'use client';

import { Paper, Text, Group, Stack, Button, Badge } from '@mantine/core';
import Link from 'next/link';
import { TaskStatusBadge } from './task-status-badge';
import type { TaskWithSpec } from '@/lib/types/task';

interface TaskDetailProps {
  task: TaskWithSpec;
  projectId: string;
  specificationId: string;
  /** Whether the spec is approved or project archived (read-only) */
  readOnly?: boolean;
  onDelete?: () => void;
}

export function TaskDetail({
  task,
  projectId,
  specificationId,
  readOnly = false,
  onDelete,
}: TaskDetailProps) {
  return (
    <Stack gap="md">
      <Paper radius="md" p="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Text size="xl" fw={600}>
              {task.title}
            </Text>
            <TaskStatusBadge status={task.status} />
          </Group>

          <Group gap="sm">
            <Text size="sm" c="dimmed">
              Position: #{task.position}
            </Text>
            <Text size="sm" c="dimmed">
              in {task.specification_title}
            </Text>
          </Group>

          {task.description ? (
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {task.description}
            </Text>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              No description provided.
            </Text>
          )}

          <Group gap="xs">
            <Text size="xs" c="dimmed">
              Created:{' '}
              {new Date(task.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text size="xs" c="dimmed">
              Updated:{' '}
              {new Date(task.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </Group>

          {!readOnly && (
            <Group>
              <Button
                component={Link}
                href={`/projects/${projectId}/specifications/${specificationId}/tasks/${task.id}/edit`}
                variant="outline"
              >
                Edit
              </Button>
              {onDelete && (
                <Button color="red" variant="outline" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </Group>
          )}

          {readOnly && (
            <Badge color="yellow" variant="light">
              Read-only
            </Badge>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
