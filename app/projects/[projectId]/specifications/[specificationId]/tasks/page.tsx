'use client';

import { Suspense } from 'react';
import { Container, Paper, Stack, Title, Group, Button, Skeleton } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { TaskList } from '@/app/components/tasks/task-list';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function TaskListPageContent() {
  const { projectId, specificationId } = useParams<{
    projectId: string;
    specificationId: string;
  }>();

  return (
    <Container size="md" py="md">
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap">
          <Title order={2}>Tasks</Title>
          <Button
            component={Link}
            href={`/projects/${projectId}/specifications/${specificationId}/tasks/new`}
            leftSection={<IconPlus size={16} />}
          >
            Add Task
          </Button>
        </Group>

        <Paper radius="md" p="md" withBorder>
          <TaskList
            projectId={projectId}
            specificationId={specificationId}
          />
        </Paper>
      </Stack>
    </Container>
  );
}

export default function TaskListPage() {
  return (
    <Suspense
      fallback={
        <Container size="md" py="md">
          <Skeleton height={400} radius="md" />
        </Container>
      }
    >
      <TaskListPageContent />
    </Suspense>
  );
}
