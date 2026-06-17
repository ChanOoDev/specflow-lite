'use client';

import { Stack, Paper, Group, Text, Badge, Title, Anchor } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import type { OpenTask } from '@/lib/types/dashboard';

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'todo':
      return 'orange';
    case 'in_progress':
      return 'blue';
    default:
      return 'gray';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    default:
      return status;
  }
}

interface OpenTasksProps {
  tasks: OpenTask[];
  totalProjects?: number;
}

export function OpenTasks({ tasks, totalProjects }: OpenTasksProps) {
  if (tasks.length === 0) {
    return (
      <Stack gap="xs">
        <Title order={4}>Open Tasks</Title>
        <Paper radius="md" p="md" withBorder>
          <Group gap="xs">
            <IconCheck size={20} stroke={1.5} color="var(--mantine-color-green-6)" />
            <Text c="dimmed" size="sm">
              All tasks completed
            </Text>
          </Group>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between" wrap="wrap">
        <Title order={4}>Open Tasks</Title>
        {totalProjects && totalProjects > 1 && (
          <Anchor component={Link} href="/projects" size="sm">
            View all
          </Anchor>
        )}
      </Group>

      <Paper radius="md" withBorder>
        <Stack gap={0}>
          {tasks.map((task, i) => (
            <Group
              key={task.id}
              justify="space-between"
              wrap="nowrap"
              px="md"
              py="sm"
              style={{
                borderBottom:
                  i < tasks.length - 1
                    ? '1px solid var(--mantine-color-default-border)'
                    : undefined,
              }}
            >
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text
                  component={Link}
                  href={`/projects/${task.projectId}/specifications/${task.specificationId}/tasks/${task.id}`}
                  size="sm"
                  fw={500}
                  truncate
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {task.title}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {task.projectName}
                </Text>
              </Stack>
              <Badge
                size="xs"
                variant="light"
                color={getStatusBadgeColor(task.status)}
                style={{ flexShrink: 0 }}
              >
                {getStatusLabel(task.status)}
              </Badge>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
