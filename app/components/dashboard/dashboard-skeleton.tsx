'use client';

import { Container, Stack, SimpleGrid, Skeleton, Paper, Group } from '@mantine/core';

export function DashboardSkeleton() {
  return (
    <Container size="md" py="md">
      <Stack gap="lg">
        {/* Summary cards skeleton */}
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <Skeleton height={100} radius="md" />
          <Skeleton height={100} radius="md" />
          <Skeleton height={100} radius="md" />
          <Skeleton height={100} radius="md" />
        </SimpleGrid>

        {/* Recent projects skeleton */}
        <Stack gap="xs">
          <Skeleton height={24} width={180} />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            <Skeleton height={80} radius="md" />
            <Skeleton height={80} radius="md" />
            <Skeleton height={80} radius="md" />
          </SimpleGrid>
        </Stack>

        {/* Open tasks skeleton */}
        <Stack gap="xs">
          <Skeleton height={24} width={160} />
          <Paper radius="md" p="md" withBorder>
            <Stack gap="sm">
              <Skeleton height={48} radius="sm" />
              <Skeleton height={48} radius="sm" />
              <Skeleton height={48} radius="sm" />
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </Container>
  );
}
