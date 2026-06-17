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
  Button,
  Group,
} from '@mantine/core';
import { ProjectForm, type ProjectFormValues } from '@/app/components/projects/project-form';
import { useProject } from '@/lib/hooks/use-project';
import { useUpdateProject } from '@/lib/hooks/use-project-mutations';
import { ALLOWED_TRANSITIONS } from '@/lib/constants/project';
import type { ProjectStatus } from '@/lib/constants/project';

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { data: project, isLoading, isError } = useProject(projectId);
  const updateMutation = useUpdateProject(projectId);

  if (isLoading) {
    return (
      <Container size="sm" py="md">
        <Stack>
          <Skeleton h={40} w={250} />
          <Skeleton h={40} />
          <Skeleton h={100} />
        </Stack>
      </Container>
    );
  }

  if (isError || !project) {
    return (
      <Container size="sm" py="md">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center">
              <Title order={3}>Project Not Found</Title>
              <Button variant="subtle" onClick={() => router.push('/projects')}>
                Back to Projects
              </Button>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  const allowedTransitions = ALLOWED_TRANSITIONS[project.status as ProjectStatus] ?? [];

  const handleSubmit = (values: ProjectFormValues) => {
    updateMutation.mutate({
      ...values,
      updated_at: project.updated_at,
    });
  };

  return (
    <Container size="sm" py="md">
      <Paper radius="md" p="xl" withBorder>
        <Stack>
          <Group justify="space-between">
            <Title order={2}>Project Settings</Title>
            <Button variant="subtle" onClick={() => router.push(`/projects/${projectId}`)}>
              Back to Project
            </Button>
          </Group>

          {updateMutation.isError && (
            <Alert color="red" variant="light">
              {(updateMutation.error as Error)?.message ?? 'Failed to update project'}
            </Alert>
          )}

          {updateMutation.isSuccess && (
            <Alert color="green" variant="light">
              Project updated successfully
            </Alert>
          )}

          <ProjectForm
            initialValues={{
              name: project.name,
              description: project.description,
            }}
            currentStatus={project.status}
            allowedTransitions={allowedTransitions}
            onSubmit={handleSubmit}
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
