'use client';

import { createClient } from '@/lib/supabase/client';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Alert,
} from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Container size="xs" mt="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack align="center">
          <Title order={2}>SpecFlow Lite</Title>
          <Text c="dimmed" size="sm">
            Sign in to manage your projects
          </Text>

          {error && (
            <Alert color="red" variant="light" w="100%">
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            leftSection={<IconBrandGithub size={20} />}
            onClick={handleSignIn}
            loading={loading}
          >
            Sign in with GitHub
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
