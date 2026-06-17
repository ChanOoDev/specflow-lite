'use client';

import { Container, Paper, Stack, Title, Alert } from '@mantine/core';
import { ProjectForm } from '@/app/components/projects/project-form';
import { useCreateProject } from '@/lib/hooks/use-project-mutations';

export default function NewProjectPage() {
  const createMutation = useCreateProject();

  return (
    <Container size="sm" py="md">
      <Paper radius="md" p="xl" withBorder>
        <Stack>
          <Title order={2}>New Project</Title>

          {createMutation.isError && (
            <Alert color="red" variant="light">
              {(createMutation.error as Error)?.message ?? 'Failed to create project'}
            </Alert>
          )}

          <ProjectForm
            onSubmit={(values) => createMutation.mutate(values)}
            loading={createMutation.isPending}
            submitLabel="Create Project"
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
