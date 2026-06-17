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
  Divider,
} from '@mantine/core';
import { IconEdit, IconTrash, IconListCheck } from '@tabler/icons-react';
import { useSpecification } from '@/lib/hooks/use-specification';
import { useDeleteSpecification } from '@/lib/hooks/use-specification-mutations';
import { useProject } from '@/lib/hooks/use-project';
import { SpecificationDetail } from '@/app/components/specifications/specification-detail';
import { SpecificationDeleteConfirm } from '@/app/components/specifications/specification-delete-confirm';
import { TaskList } from '@/app/components/tasks/task-list';
import { Suspense, useState } from 'react';
import Link from 'next/link';

function SpecificationDetailPageContent() {
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

  const taskCounts = specification.task_counts;

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

        <SpecificationDetail specification={specification} projectId={projectId} />

        <Divider />

        {/* Task Progress & List */}
        <Group justify="space-between" wrap="wrap">
          <Group gap="sm">
            <IconListCheck size={20} />
            <Text size="sm" fw={500}>
              {taskCounts
                ? `${taskCounts.done} of ${taskCounts.total} tasks done`
                : '0 of 0 tasks'}
            </Text>
            <Button
              variant="subtle"
              size="compact-sm"
              component={Link}
              href={`/projects/${projectId}/specifications/${specificationId}/tasks`}
            >
              View All
            </Button>
          </Group>
          {!isArchived && specification.status !== 'approved' && (
            <Button
              component={Link}
              href={`/projects/${projectId}/specifications/${specificationId}/tasks/new`}
              size="xs"
            >
              Add Task
            </Button>
          )}
        </Group>

        <Suspense fallback={<Skeleton height={200} radius="md" />}>
          <TaskList
            projectId={projectId}
            specificationId={specificationId}
          />
        </Suspense>
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

export default function SpecificationDetailPage() {
  return (
    <Suspense
      fallback={
        <Container size="md" py="md">
          <Skeleton height={600} radius="md" />
        </Container>
      }
    >
      <SpecificationDetailPageContent />
    </Suspense>
  );
}
