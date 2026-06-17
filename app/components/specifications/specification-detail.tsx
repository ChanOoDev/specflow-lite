'use client';

import { Paper, Stack, Title, Text, Group, Badge, Card } from '@mantine/core';
import { SpecStatusBadge } from './spec-status-badge';
import type { SpecificationWithLinks } from '@/lib/types/specification';

interface SpecificationDetailProps {
  specification: SpecificationWithLinks;
}

function RequirementLinkCard({
  requirement,
}: {
  requirement: {
    id: string;
    title: string;
    type: string;
    priority: string;
    status: string;
  };
}) {
  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2}>
          <Text size="sm" fw={600}>
            {requirement.title}
          </Text>
          <Group gap="xs">
            <Badge size="xs" variant="outline" color="gray">
              {requirement.type}
            </Badge>
            <Badge size="xs" variant="outline" color="gray">
              {requirement.priority}
            </Badge>
          </Group>
        </Stack>
        <Badge size="sm" variant="light">
          {requirement.status}
        </Badge>
      </Group>
    </Card>
  );
}

export function SpecificationDetail({
  specification,
}: SpecificationDetailProps) {
  const createdDate = new Date(specification.created_at).toLocaleDateString();
  const updatedDate = new Date(specification.updated_at).toLocaleDateString();

  return (
    <Stack>
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>{specification.title}</Title>
        <SpecStatusBadge status={specification.status} />
      </Group>

      {specification.description && (
        <Text c="dimmed">{specification.description}</Text>
      )}

      <Group gap="xl">
        <Text size="xs" c="dimmed">
          Created {createdDate}
        </Text>
        <Text size="xs" c="dimmed">
          Updated {updatedDate}
        </Text>
      </Group>

      {/* Linked Requirements */}
      <Stack gap="sm">
        <Text size="sm" fw={600}>
          Linked Requirements ({specification.linked_requirements.length})
        </Text>
        {specification.linked_requirements.length === 0 ? (
          <Text size="sm" c="dimmed">
            No requirements linked to this specification.
          </Text>
        ) : (
          <Stack gap="sm">
            {specification.linked_requirements.map((req) => (
              <RequirementLinkCard key={req.id} requirement={req} />
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
