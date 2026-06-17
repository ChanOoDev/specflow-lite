'use client';

import { Container, Paper, Stack, Title, Alert } from '@mantine/core';
import { RequirementForm } from '@/app/components/requirements/requirement-form';
import { useCreateRequirement } from '@/lib/hooks/use-requirement-mutations';
import { useParams } from 'next/navigation';

export default function NewRequirementPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const createMutation = useCreateRequirement(projectId);

  return (
    <Container size="sm" py="md">
      <Paper radius="md" p="xl" withBorder>
        <Stack>
          <Title order={2}>New Requirement</Title>

          {createMutation.isError && (
            <Alert color="red" variant="light">
              {(createMutation.error as Error)?.message ??
                'Failed to create requirement'}
            </Alert>
          )}

          <RequirementForm
            onSubmit={(values) => createMutation.mutate({
              title: values.title,
              description: values.description,
              type: values.type,
              priority: values.priority,
            })}
            loading={createMutation.isPending}
            submitLabel="Create Requirement"
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
