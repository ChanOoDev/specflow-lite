import { Container, Paper, Stack, Title, Text, Button, Center } from '@mantine/core';
import { IconFolderPlus } from '@tabler/icons-react';
import Link from 'next/link';

export function EmptyState() {
  return (
    <Container size="sm" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Center>
          <Stack align="center" gap="md">
            <IconFolderPlus
              size={48}
              stroke={1.5}
              color="var(--mantine-color-dimmed)"
            />
            <Title order={4}>No projects yet</Title>
            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Create your first project to start capturing requirements,
              generating specifications, and tracking implementation progress.
            </Text>
            <Button
              component={Link}
              href="/projects/new"
              leftSection={<IconFolderPlus size={18} />}
            >
              Create Your First Project
            </Button>
          </Stack>
        </Center>
      </Paper>
    </Container>
  );
}
