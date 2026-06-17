'use client';

import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { TypeBadge } from './type-badge';
import { PriorityBadge } from './priority-badge';
import Link from 'next/link';
import type { Requirement } from '@/lib/types/requirement';

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  approved: 'green',
  implemented: 'blue',
  deferred: 'yellow',
};

function RequirementStatusBadge({ status }: { status: string }) {
  return (
    <Badge color={STATUS_COLORS[status] ?? 'gray'} variant="light">
      {status}
    </Badge>
  );
}

interface RequirementCardProps {
  requirement: Requirement;
  projectId: string;
}

export function RequirementCard({ requirement, projectId }: RequirementCardProps) {
  const date = new Date(requirement.updated_at).toLocaleDateString();

  return (
    <Card
      component={Link}
      href={`/projects/${projectId}/requirements/${requirement.id}`}
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} truncate>
            {requirement.title}
          </Text>
          <Group gap="xs" wrap="nowrap">
            <TypeBadge type={requirement.type} />
            <PriorityBadge priority={requirement.priority} />
            <RequirementStatusBadge status={requirement.status} />
          </Group>
        </Group>

        {requirement.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {requirement.description}
          </Text>
        )}

        <Text size="xs" c="dimmed">
          Updated {date}
        </Text>
      </Stack>
    </Card>
  );
}
