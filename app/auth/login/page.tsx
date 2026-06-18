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
  Divider,
} from '@mantine/core';
import { IconBrandGithub, IconUser } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function setGuestCookie() {
  document.cookie = 'guest-mode=true; path=/; max-age=86400; SameSite=Lax';
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `https://specflow-lite.vercel.app/auth/callback`,
        },
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setGuestCookie();
    router.push('/projects');
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

          <Divider label="or" labelPosition="center" w="100%" />

          <Button
            fullWidth
            variant="outline"
            leftSection={<IconUser size={20} />}
            onClick={handleGuestLogin}
          >
            Continue as Guest
          </Button>

          <Text size="xs" c="dimmed">
            Guest users can browse all projects and data
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
