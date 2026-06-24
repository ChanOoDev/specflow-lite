'use client';

import { Container, Stack, SimpleGrid, Skeleton, Paper, Group } from '@mantine/core';

export function RequirementListSkeleton() {
  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <Skeleton height={32} width={180} />
          <Group gap="sm">
            <Skeleton height={36} width={200} />
            <Skeleton height={36} width={120} />
            <Skeleton height={36} width={120} />
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <Paper key={i} radius="md" p="lg" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Skeleton height={20} width={180} />
                  <Skeleton height={20} width={60} />
                </Group>
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="80%" />
                <Group gap="xs">
                  <Skeleton height={20} width={50} />
                  <Skeleton height={20} width={50} />
                  <Skeleton height={20} width={50} />
                </Group>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
