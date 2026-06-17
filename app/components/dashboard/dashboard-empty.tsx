'use client';

import { Container, Paper, Stack, Title, Text, Button, Center } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export function DashboardEmpty() {
  return (
    <Container size="md" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Center>
          <Stack align="center" gap="md">
            <Title order={3}>Welcome to SpecFlow Lite</Title>
            <Text c="dimmed" ta="center" maw={400}>
              You don&apos;t have any projects yet. Create your first project to
              start capturing requirements, generating specifications, and tracking
              development tasks.
            </Text>
            <Button
              component={Link}
              href="/projects/new"
              leftSection={<IconPlus size={18} />}
              size="md"
            >
              Create Your First Project
            </Button>
          </Stack>
        </Center>
      </Paper>
    </Container>
  );
}
