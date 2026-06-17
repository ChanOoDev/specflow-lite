'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Skeleton,
  Center,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useRequirement } from '@/lib/hooks/use-requirement';
import { useDeleteRequirement } from '@/lib/hooks/use-requirement-mutations';
import { RequirementDetail } from '@/app/components/requirements/requirement-detail';
import { RequirementDeleteConfirm } from '@/app/components/requirements/requirement-delete-confirm';
import { useState } from 'react';

export default function RequirementDetailPage() {
  const { projectId, requirementId } = useParams<{
    projectId: string;
    requirementId: string;
  }>();
  const router = useRouter();
  const { data: requirement, isLoading, isError } = useRequirement(
    projectId,
    requirementId
  );
  const deleteMutation = useDeleteRequirement(projectId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <Container size="md" py="md">
        <Stack>
          <Skeleton h={40} w={300} />
          <Skeleton h={20} />
          <Skeleton h={80} />
        </Stack>
      </Container>
    );
  }

  if (isError || !requirement) {
    return (
      <Container size="md" py="xl">
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

  const isArchived = false; // Project archived status not needed at detail level

  return (
    <Container size="md" py="md">
      <Stack>
        <Group justify="space-between" wrap="wrap">
          <Button
            variant="subtle"
            onClick={() =>
              router.push(`/projects/${projectId}/requirements`)
            }
          >
            ← Back to Requirements
          </Button>

          {!isArchived && (
            <Group>
              <Button
                variant="subtle"
                leftSection={<IconEdit size={18} />}
                onClick={() =>
                  router.push(
                    `/projects/${projectId}/requirements/${requirementId}/edit`
                  )
                }
              >
                Edit
              </Button>
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={18} />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            </Group>
          )}
        </Group>

        <RequirementDetail requirement={requirement} />
      </Stack>

      <RequirementDeleteConfirm
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(requirementId, {
            onSuccess: () => {
              router.push(`/projects/${projectId}/requirements`);
            },
          });
        }}
        requirementTitle={requirement.title}
        loading={deleteMutation.isPending}
      />
    </Container>
  );
}
