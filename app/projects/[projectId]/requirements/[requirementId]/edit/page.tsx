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
import { RequirementForm } from '@/app/components/requirements/requirement-form';
import { useRequirement } from '@/lib/hooks/use-requirement';
import { useUpdateRequirement } from '@/lib/hooks/use-requirement-mutations';
import { useProject } from '@/lib/hooks/use-project';
import { ALLOWED_TRANSITIONS } from '@/lib/constants/requirement';

export default function EditRequirementPage() {
  const { projectId, requirementId } = useParams<{
    projectId: string;
    requirementId: string;
  }>();
  const router = useRouter();

  const { data: requirement, isLoading, isError } = useRequirement(
    projectId,
    requirementId
  );
  const { data: project } = useProject(projectId);

  const updateMutation = useUpdateRequirement(projectId, requirementId);

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
            <Skeleton h={40} />
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (isError || !requirement) {
    return (
      <Container size="sm" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center">
              <Title order={3}>Requirement Not Found</Title>
              <Text c="dimmed">
                This requirement does not exist or you do not have access to it.
              </Text>
              <Button
                variant="subtle"
                onClick={() =>
                  router.push(`/projects/${projectId}/requirements`)
                }
              >
                Back to Requirements
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
                This project is archived and its requirements are read-only.
              </Text>
              <Button
                variant="subtle"
                onClick={() =>
                  router.push(
                    `/projects/${projectId}/requirements/${requirementId}`
                  )
                }
              >
                Back to Requirement
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
          <Title order={2}>Edit Requirement</Title>

          {updateMutation.isError && (
            <Alert color="red" variant="light">
              {(updateMutation.error as Error)?.message ??
                'Failed to update requirement'}
            </Alert>
          )}

          <RequirementForm
            initialValues={{
              title: requirement.title,
              description: requirement.description,
              type: requirement.type,
              priority: requirement.priority,
            }}
            currentStatus={requirement.status}
            allowedTransitions={
              ALLOWED_TRANSITIONS[requirement.status] ?? []
            }
            onSubmit={(values) => {
              const payload: Record<string, unknown> = {
                updated_at: requirement.updated_at,
              };
              if (values.title !== requirement.title)
                payload.title = values.title;
              if (values.description !== requirement.description)
                payload.description = values.description;
              if (values.type !== requirement.type)
                payload.type = values.type;
              if (values.priority !== requirement.priority)
                payload.priority = values.priority;
              if (values.status && values.status !== requirement.status)
                payload.status = values.status;

              updateMutation.mutate(payload, {
                onSuccess: () => {
                  router.push(
                    `/projects/${projectId}/requirements/${requirementId}`
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
