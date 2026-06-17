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
import { useSpecification } from '@/lib/hooks/use-specification';
import { useDeleteSpecification } from '@/lib/hooks/use-specification-mutations';
import { useProject } from '@/lib/hooks/use-project';
import { SpecificationDetail } from '@/app/components/specifications/specification-detail';
import { SpecificationDeleteConfirm } from '@/app/components/specifications/specification-delete-confirm';
import { useState } from 'react';

export default function SpecificationDetailPage() {
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
  const deleteMutation = useDeleteSpecification(projectId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isArchived = project?.status === 'archived';

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

  if (isError || !specification) {
    return (
      <Container size="md" py="xl">
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

  return (
    <Container size="md" py="md">
      <Stack>
        <Group justify="space-between" wrap="wrap">
          <Button
            variant="subtle"
            onClick={() =>
              router.push(`/projects/${projectId}/specifications`)
            }
          >
            ← Back to Specifications
          </Button>

          {!isArchived && (
            <Group>
              <Button
                variant="subtle"
                leftSection={<IconEdit size={18} />}
                onClick={() =>
                  router.push(
                    `/projects/${projectId}/specifications/${specificationId}/edit`
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

        <SpecificationDetail specification={specification} />
      </Stack>

      <SpecificationDeleteConfirm
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(specificationId, {
            onSuccess: () => {
              router.push(`/projects/${projectId}/specifications`);
            },
          });
        }}
        specificationTitle={specification.title}
        loading={deleteMutation.isPending}
      />
    </Container>
  );
}
