'use client';

import { SimpleGrid, Card, Stack, Text, Group, Tooltip, Badge } from '@mantine/core';
import Link from 'next/link';
import type { RecentProject } from '@/lib/types/dashboard';

function getStatusColor(status?: string): string {
  switch (status) {
    case 'active':
      return 'green';
    case 'paused':
      return 'warm';
    case 'completed':
      return 'sage';
    case 'archived':
      return 'slate';
    default:
      return 'gray';
  }
}

interface RecentProjectsProps {
  projects: (RecentProject & { status?: string })[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <Stack gap="xs">
      <Text size="sm" fw={600} c="dimmed">
        Recent Projects
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {projects.map((p) => (
          <Card
            key={p.projectId}
            component={Link}
            href={`/projects/${p.projectId}`}
            shadow="xs"
            padding="md"
            radius="md"
            withBorder
            className="hover-lift animate-in"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Stack gap="xs">
              <Tooltip
                label={p.projectName}
                disabled={p.projectName.length < 30}
              >
                <Text fw={600} size="sm" truncate>
                  {p.projectName}
                </Text>
              </Tooltip>
              {p.status && (
                <Badge
                  size="xs"
                  variant="light"
                  color={getStatusColor(p.status)}
                >
                  {p.status}
                </Badge>
              )}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
