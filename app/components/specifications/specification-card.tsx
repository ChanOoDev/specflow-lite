'use client';

import { Card, Group, Stack, Text } from '@mantine/core';
import { SpecStatusBadge } from './spec-status-badge';
import Link from 'next/link';
import type { Specification } from '@/lib/types/specification';

interface SpecificationCardProps {
  specification: Specification;
  projectId: string;
}

export function SpecificationCard({
  specification,
  projectId,
}: SpecificationCardProps) {
  const date = new Date(specification.updated_at).toLocaleDateString();

  return (
    <Card
      component={Link}
      href={`/projects/${projectId}/specifications/${specification.id}`}
      shadow="xs"
      padding="md"
      radius="md"
      withBorder
      className="hover-lift animate-in"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} truncate>
            {specification.title}
          </Text>
          <SpecStatusBadge status={specification.status} />
        </Group>

        {specification.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>
            {specification.description}
          </Text>
        )}

        <Text size="xs" c="dimmed">
          Updated {date}
        </Text>
      </Stack>
    </Card>
  );
}
