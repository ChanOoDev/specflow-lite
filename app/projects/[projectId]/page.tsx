'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  SimpleGrid,
  Card,
  Badge,
  Button,
  Skeleton,
  Center,
  Loader,
} from '@mantine/core';
import {
  IconEdit,
  IconArchive,
  IconArchiveOff,
  IconTrash,
} from '@tabler/icons-react';
import { useProject } from '@/lib/hooks/use-project';
import { StatusBadge } from '@/app/components/projects/status-badge';
import { DeleteConfirmModal } from '@/app/components/projects/delete-confirm';
import { useArchiveProject, useRestoreProject, useDeleteProject } from '@/lib/hooks/use-project-mutations';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { data: project, isLoading, isError } = useProject(projectId);
  const archiveMutation = useArchiveProject();
  const restoreMutation = useRestoreProject();
  const deleteMutation = useDeleteProject();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <Container size="md" py="md">
        <Stack>
          <Skeleton h={40} w={300} />
          <Skeleton h={20} />
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <Skeleton h={80} />
            <Skeleton h={80} />
            <Skeleton h={80} />
            <Skeleton h={80} />
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  if (isError || !project) {
    return (
      <Container size="md" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center">
              <Title order={3}>Project Not Found</Title>
              <Text c="dimmed">This project does not exist or you do not have access to it.</Text>
              <Button variant="subtle" onClick={() => router.push('/projects')}>
                Back to Projects
              </Button>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  const isArchived = project.status === 'archived';
  const createdDate = new Date(project.created_at).toLocaleDateString();
  const updatedDate = new Date(project.updated_at).toLocaleDateString();

  const countCards = [
    { label: 'Requirements', count: project.counts.requirements, href: `/projects/${projectId}/requirements` },
    { label: 'Specifications', count: project.counts.specifications, href: `/projects/${projectId}/specifications` },
    { label: 'Tasks', count: project.counts.tasks },
    { label: 'Completed', count: project.counts.completedTasks },
  ];

  return (
    <Container size="md" py="md">
      <Stack>
        <Group justify="space-between" wrap="wrap">
          <Group>
            <Title order={2}>{project.name}</Title>
            <StatusBadge status={project.status} />
          </Group>

          {!isArchived && (
            <Group>
              <Button
                variant="subtle"
                leftSection={<IconEdit size={18} />}
                onClick={() => router.push(`/projects/${projectId}/settings`)}
              >
                Settings
              </Button>
              <Button
                variant="subtle"
                color="yellow"
                leftSection={<IconArchive size={18} />}
                onClick={() => archiveMutation.mutate(projectId)}
                loading={archiveMutation.isPending}
              >
                Archive
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

          {isArchived && (
            <Button
              variant="subtle"
              color="green"
              leftSection={<IconArchiveOff size={18} />}
              onClick={() => restoreMutation.mutate(projectId)}
              loading={restoreMutation.isPending}
            >
              Restore
            </Button>
          )}
        </Group>

        {project.description && (
          <Text c="dimmed">{project.description}</Text>
        )}

        <Group gap="xl">
          <Text size="xs" c="dimmed">
            Created {createdDate}
          </Text>
          <Text size="xs" c="dimmed">
            Updated {updatedDate}
          </Text>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          {countCards.map((card) => {
            const content = (
              <Card key={card.label} shadow="sm" padding="md" radius="md" withBorder style={'href' in card ? { cursor: 'pointer' } : undefined}>
                <Stack align="center" gap="xs">
                  <Text size="xl" fw={700}>
                    {card.count}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {card.label}
                  </Text>
                </Stack>
              </Card>
            );
            if ('href' in card && card.href) {
              return (
                <Link key={card.label} href={card.href as string} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {content}
                </Link>
              );
            }
            return content;
          })}
        </SimpleGrid>
      </Stack>

      <DeleteConfirmModal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(projectId)}
        projectName={project.name}
        loading={deleteMutation.isPending}
      />
    </Container>
  );
}
