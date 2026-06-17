'use client';

import { Container, Paper, Stack, Title, Alert } from '@mantine/core';
import { TaskForm } from '@/app/components/tasks/task-form';
import { useCreateTask } from '@/lib/hooks/use-task-mutations';
import { useParams } from 'next/navigation';

export default function NewTaskPage() {
  const { projectId, specificationId } = useParams<{
    projectId: string;
    specificationId: string;
  }>();
  const createMutation = useCreateTask(projectId, specificationId);

  return (
    <Container size="sm" py="md">
      <Paper radius="md" p="xl" withBorder>
        <Stack>
          <Title order={2}>New Task</Title>

          {createMutation.isError && (
            <Alert color="red" variant="light">
              {(createMutation.error as Error)?.message ??
                'Failed to create task'}
            </Alert>
          )}

          <TaskForm
            onSubmit={(values) =>
              createMutation.mutate({
                title: values.title,
                description: values.description,
              })
            }
            loading={createMutation.isPending}
            submitLabel="Create Task"
            error={
              createMutation.isError
                ? (createMutation.error as Error)?.message
                : null
            }
          />
        </Stack>
      </Paper>
    </Container>
  );
}
