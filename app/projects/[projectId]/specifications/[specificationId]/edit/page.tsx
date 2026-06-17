'use client';

import { useParams, useRouter } from 'next/navigation';
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
import { SpecificationForm } from '@/app/components/specifications/specification-form';
import { useSpecification } from '@/lib/hooks/use-specification';
import { useUpdateSpecification } from '@/lib/hooks/use-specification-mutations';
import { useProject } from '@/lib/hooks/use-project';
import { ALLOWED_TRANSITIONS } from '@/lib/constants/specification';

export default function EditSpecificationPage() {
  const { projectId, specificationId } = useParams<{
    projectId: string;
    specificationId: string;
  }>();
  const router = useRouter();

  const { data: specification, isLoading, isError } = useSpecification(
    projectId,
    specificationId
  );
  const { data: project } = useProject(projectId);

  const updateMutation = useUpdateSpecification(projectId, specificationId);

  const isArchived = project?.status === 'archived';

  if (isLoading) {
    return (
      <Container size="sm" py="md">
        <Paper radius="md" p="xl" withBorder>
          <Stack>
            <Skeleton h={32} w={200} />
            <Skeleton h={40} />
            <Skeleton h={120} />
            <Skeleton h={40} />
            <Skeleton h={40} />
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (isError || !specification) {
    return (
      <Container size="sm" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center">
              <Title order={3}>Specification Not Found</Title>
              <Text c="dimmed">
                This specification does not exist or you do not have access to
                it.
              </Text>
              <Button
                variant="subtle"
                onClick={() =>
                  router.push(`/projects/${projectId}/specifications`)
                }
              >
                Back to Specifications
              </Button>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  if (isArchived) {
    return (
      <Container size="sm" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center">
              <Title order={3}>Project Archived</Title>
              <Text c="dimmed">
                This project is archived and its specifications are read-only.
              </Text>
              <Button
                variant="subtle"
                onClick={() =>
                  router.push(
                    `/projects/${projectId}/specifications/${specificationId}`
                  )
                }
              >
                Back to Specification
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
          <Title order={2}>Edit Specification</Title>

          {updateMutation.isError && (
            <Alert color="red" variant="light">
              {(updateMutation.error as Error)?.message ??
                'Failed to update specification'}
            </Alert>
          )}

          <SpecificationForm
            projectId={projectId}
            initialValues={{
              title: specification.title,
              description: specification.description,
            }}
            currentStatus={specification.status}
            allowedTransitions={
              ALLOWED_TRANSITIONS[
                specification.status as keyof typeof ALLOWED_TRANSITIONS
              ] ?? []
            }
            currentLinkedRequirementIds={
              specification.linked_requirements?.map((r) => r.id) ?? []
            }
            onSubmit={(values) => {
              const payload: Record<string, unknown> = {
                updated_at: specification.updated_at,
              };
              if (values.title !== specification.title)
                payload.title = values.title;
              if (values.description !== specification.description)
                payload.description = values.description;
              if (values.status && values.status !== specification.status)
                payload.status = values.status;

              // Always include linked_requirement_ids for the diff-based
              // linking/unlinking in the API
              payload.linked_requirement_ids =
                values.linkedRequirementIds ?? [];

              updateMutation.mutate(payload, {
                onSuccess: () => {
                  router.push(
                    `/projects/${projectId}/specifications/${specificationId}`
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
