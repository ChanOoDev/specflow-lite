'use client';

import { Paper, Text, Button, Stack, Center, ThemeIcon } from '@mantine/core';
import { IconChecklist } from '@tabler/icons-react';
import Link from 'next/link';

interface TaskEmptyStateProps {
  projectId: string;
  specificationId: string;
}

export function TaskEmptyState({
  projectId,
  specificationId,
}: TaskEmptyStateProps) {
  return (
    <Paper radius="md" p="xl" withBorder>
      <Center>
        <Stack align="center" gap="md" maw={400}>
          <ThemeIcon variant="light" size={64} radius="xl">
            <IconChecklist size={32} />
          </ThemeIcon>
          <Text size="lg" fw={500} ta="center">
            No tasks yet
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Create tasks to track implementation progress within this
            specification.
          </Text>
          <Button
            component={Link}
            href={`/projects/${projectId}/specifications/${specificationId}/tasks/new`}
          >
            Add Your First Task
          </Button>
        </Stack>
      </Center>
    </Paper>
  );
}
