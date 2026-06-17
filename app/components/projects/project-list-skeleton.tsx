'use client';

import { Skeleton, SimpleGrid, Stack, Group, Card } from '@mantine/core';

export function ProjectListSkeleton() {
  return (
    <Stack>
      {/* Toolbar skeleton */}
      <Group justify="space-between" wrap="wrap">
        <Group wrap="wrap">
          <Skeleton width={200} height={36} radius="sm" />
          <Skeleton width={140} height={36} radius="sm" />
          <Skeleton width={130} height={36} radius="sm" />
        </Group>
        <Skeleton width={140} height={36} radius="sm" />
      </Group>

      {/* Card grid skeleton */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Skeleton height={24} width="70%" radius="sm" />
              <Skeleton height={16} width="100%" radius="sm" />
              <Skeleton height={16} width="40%" radius="sm" />
              <Group mt="xs">
                <Skeleton height={22} width={80} radius="xl" />
                <Skeleton height={14} width={100} radius="sm" />
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
