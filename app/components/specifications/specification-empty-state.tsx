'use client';

import { Container, Paper, Stack, Text, Button, Center } from '@mantine/core';
import { IconFileDescription } from '@tabler/icons-react';
import Link from 'next/link';

interface SpecificationEmptyStateProps {
  projectId: string;
  hasFilters?: boolean;
}

export function SpecificationEmptyState({
  projectId,
  hasFilters = false,
}: SpecificationEmptyStateProps) {
  if (hasFilters) {
    return (
      <Container size="sm" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <Text size="lg" fw={600}>
                No specifications match your search
              </Text>
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
            <IconFileDescription
              size={64}
              stroke={1.5}
              color="var(--mantine-color-gray-5)"
            />
            <Text size="lg" fw={600}>
              No specifications yet
            </Text>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Create your first specification to start documenting the
              technical approach for your project.
            </Text>
            <Button
              component={Link}
              href={`/projects/${projectId}/specifications/new`}
              leftSection={<IconFileDescription size={18} />}
            >
              Create Your First Specification
            </Button>
          </Stack>
        </Center>
      </Paper>
    </Container>
  );
}
