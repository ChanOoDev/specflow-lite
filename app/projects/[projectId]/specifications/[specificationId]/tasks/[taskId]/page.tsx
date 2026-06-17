'use client';

import { Suspense } from 'react';
import {
  Container,
  Paper,
  Stack,
  Title,
  Group,
  Button,
  Alert,
  Skeleton,
  Center,
  Text,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { TaskDetail } from '@/app/components/tasks/task-detail';
import { TaskDeleteConfirm } from '@/app/components/tasks/task-delete-confirm';
import { useTask } from '@/lib/hooks/use-task';
import { useDeleteTask } from '@/lib/hooks/use-task-mutations';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

function TaskDetailPageContent() {
  const { projectId, specificationId, taskId } = useParams<{
    projectId: string;
    specificationId: string;
    taskId: string;
  }>();
  const router = useRouter();
  const { data: task, isLoading, isError, error } = useTask(
    projectId,
    specificationId,
    taskId
  );
  const deleteMutation = useDeleteTask(projectId, specificationId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <Container size="md" py="md">
        <Skeleton height={300} radius="md" />
      </Container>
    );
  }

  if (isError || !task) {
    return (
      <Container size="md" py="md">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <Title order={3}>Task Not Found</Title>
              <Text c="dimmed">
                {((error as Error)?.message?.includes('NOT_FOUND')
                  ? 'This task does not exist or you do not have access to it.'
                  : (error as Error)?.message) ??
                  'This task does not exist or you do not have access to it.'}
              </Text>
              <Button
                component={Link}
                href={`/projects/${projectId}/specifications/${specificationId}/tasks`}
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
              >
                Back to Tasks
              </Button>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(taskId, {
      onSuccess: () => {
        router.push(
          `/projects/${projectId}/specifications/${specificationId}/tasks`
        );
      },
    });
  };

  return (
    <Container size="md" py="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Button
            component={Link}
            href={`/projects/${projectId}/specifications/${specificationId}/tasks`}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Tasks
          </Button>
        </Group>

        {deleteMutation.isError && (
          <Alert color="red" variant="light">
            {(deleteMutation.error as Error)?.message ?? 'Failed to delete task'}
          </Alert>
        )}

        <TaskDetail
          task={task}
          projectId={projectId}
          specificationId={specificationId}
          onDelete={() => setDeleteOpen(true)}
        />
      </Stack>

      <TaskDeleteConfirm
        taskTitle={task.title}
        opened={deleteOpen}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </Container>
  );
}

export default function TaskDetailPage() {
  return (
    <Suspense
      fallback={
        <Container size="md" py="md">
          <Skeleton height={300} radius="md" />
        </Container>
      }
    >
      <TaskDetailPageContent />
    </Suspense>
  );
}
