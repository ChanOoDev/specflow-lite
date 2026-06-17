'use client';

import { Badge, Paper, Stack, Title, Text, Group, SimpleGrid, Card } from '@mantine/core';
import { TypeBadge } from './type-badge';
import { PriorityBadge } from './priority-badge';
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

interface RequirementDetailProps {
  requirement: Requirement;
}

export function RequirementDetail({ requirement }: RequirementDetailProps) {
  const createdDate = new Date(requirement.created_at).toLocaleDateString();
  const updatedDate = new Date(requirement.updated_at).toLocaleDateString();

  return (
    <Stack>
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>{requirement.title}</Title>
        <Group gap="xs">
          <TypeBadge type={requirement.type} />
          <PriorityBadge priority={requirement.priority} />
          <RequirementStatusBadge status={requirement.status} />
        </Group>
      </Group>

      {requirement.description && (
        <Text c="dimmed">{requirement.description}</Text>
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
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack align="center" gap="xs">
            <Text size="xs" c="dimmed">Type</Text>
            <TypeBadge type={requirement.type} />
          </Stack>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack align="center" gap="xs">
            <Text size="xs" c="dimmed">Priority</Text>
            <PriorityBadge priority={requirement.priority} />
          </Stack>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack align="center" gap="xs">
            <Text size="xs" c="dimmed">Status</Text>
            <RequirementStatusBadge status={requirement.status} />
          </Stack>
        </Card>
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Stack align="center" gap="xs">
            <Text size="xs" c="dimmed">Project</Text>
            <Text size="sm" fw={600} c="dimmed">
              {requirement.project_id.slice(0, 8)}...
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
