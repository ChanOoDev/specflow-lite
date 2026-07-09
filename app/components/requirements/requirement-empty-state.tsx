'use client';

import { Container, Paper, Stack, Title, Text, Button, Center } from '@mantine/core';
import { IconFilePlus } from '@tabler/icons-react';
import Link from 'next/link';

interface RequirementEmptyStateProps {
  projectId: string;
  hasFilters?: boolean;
}

export function RequirementEmptyState({
  projectId,
  hasFilters = false,
}: RequirementEmptyStateProps) {
  if (hasFilters) {
    return (
      <Container size="sm" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <Title order={4}>No requirements match your search</Title>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Try adjusting your search terms or filters to find what
                you&apos;re looking for.
              </Text>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Center>
          <Stack align="center" gap="md">
            <IconFilePlus
              size={48}
              stroke={1.5}
              color="var(--mantine-color-dimmed)"
            />
            <Title order={4}>No requirements yet</Title>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Add your first requirement to start capturing what needs to be
              built.
            </Text>
            <Button
              component={Link}
              href={`/projects/${projectId}/requirements/new`}
              leftSection={<IconFilePlus size={18} />}
            >
              Add Your First Requirement
            </Button>
          </Stack>
        </Center>
      </Paper>
    </Container>
  );
}
