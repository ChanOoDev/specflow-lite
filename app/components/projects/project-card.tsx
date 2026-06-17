import { Card, Group, Stack, Text } from '@mantine/core';
import { StatusBadge } from './status-badge';
import Link from 'next/link';
import type { ProjectWithCounts } from '@/lib/types/project';

interface ProjectCardProps {
  project: ProjectWithCounts;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const date = new Date(project.updated_at).toLocaleDateString();

  return (
    <Card
      component={Link}
      href={`/projects/${project.id}`}
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} truncate>
            {project.name}
          </Text>
          <StatusBadge status={project.status} />
        </Group>

        {project.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {project.description}
          </Text>
        )}

        <Group gap="xl">
          <Text size="xs" c="dimmed">
            {project.counts.requirements} reqs · {project.counts.specifications} specs ·{' '}
            {project.counts.tasks} tasks
          </Text>
          <Text size="xs" c="dimmed" ml="auto">
            Updated {date}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}
