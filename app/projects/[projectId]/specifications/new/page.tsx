'use client';

import { Container, Paper, Stack, Title, Alert } from '@mantine/core';
import { SpecificationForm } from '@/app/components/specifications/specification-form';
import { useCreateSpecification } from '@/lib/hooks/use-specification-mutations';
import { useParams } from 'next/navigation';

export default function NewSpecificationPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const createMutation = useCreateSpecification(projectId);

  return (
    <Container size="sm" py="md">
      <Paper radius="md" p="xl" withBorder>
        <Stack>
          <Title order={2}>New Specification</Title>

          {createMutation.isError && (
            <Alert color="red" variant="light">
              {(createMutation.error as Error)?.message ??
                'Failed to create specification'}
            </Alert>
          )}

          <SpecificationForm
            projectId={projectId}
            onSubmit={(values) =>
              createMutation.mutate({
                title: values.title,
                description: values.description,
                linked_requirement_ids: values.linkedRequirementIds,
              })
            }
            loading={createMutation.isPending}
            submitLabel="Create Specification"
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
