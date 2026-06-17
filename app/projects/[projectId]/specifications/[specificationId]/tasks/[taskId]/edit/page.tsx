'use client';

import {
  Container,
  Paper,
  Stack,
  Title,
  Alert,
  Skeleton,
  Center,
  Text,
  Button,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { TaskForm } from '@/app/components/tasks/task-form';
import { useTask } from '@/lib/hooks/use-task';
import { useUpdateTask } from '@/lib/hooks/use-task-mutations';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditTaskPage() {
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
  const updateMutation = useUpdateTask(
    projectId,
    specificationId,
    taskId
  );

  if (isLoading) {
    return (
      <Container size="sm" py="md">
        <Skeleton height={400} radius="md" />
      </Container>
    );
  }

  if (isError || !task) {
    return (
      <Container size="sm" py="md">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <Title order={3}>Task Not Found</Title>
              <Text c="dimmed">
                {(error as Error)?.message ??
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

  return (
    <Container size="sm" py="md">
      <Paper radius="md" p="xl" withBorder>
        <Stack>
          <Title order={2}>Edit Task</Title>

          {updateMutation.isError && (
            <Alert color="red" variant="light">
              {(updateMutation.error as Error)?.message ??
                'Failed to update task'}
            </Alert>
          )}

          <TaskForm
            initialValues={{
              title: task.title,
              description: task.description,
              position: task.position,
            }}
            currentStatus={task.status}
            isEdit
            onSubmit={(values) => {
              const payload: Record<string, unknown> = {
                updated_at: task.updated_at,
              };
              if (values.title !== task.title) payload.title = values.title;
              if (values.description !== task.description)
                payload.description = values.description;
              if (values.status) payload.status = values.status;
              if (
                values.position !== undefined &&
                values.position !== task.position
              )
                payload.position = values.position;

              updateMutation.mutate(payload, {
                onSuccess: () => {
                  router.push(
                    `/projects/${projectId}/specifications/${specificationId}/tasks/${taskId}`
                  );
                },
              });
            }}
            loading={updateMutation.isPending}
            submitLabel="Save Changes"
            error={
              updateMutation.isError
                ? (updateMutation.error as Error)?.message
                : null
            }
          />
        </Stack>
      </Paper>
    </Container>
  );
}
