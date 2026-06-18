'use client';

import { AppShell, Burger, Group, Title, Menu, ActionIcon, Avatar, Text, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUser, IconLogout, IconMoon, IconSun } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { Navbar } from './navbar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

function UserMenu() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [clientError, setClientError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (!cancelled && data.user) setUser(data.user);
      }).catch(() => {
        if (!cancelled) setClientError(true);
      });
    } catch {
      if (!cancelled) setClientError(true);
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch {
      // Silently fail — user is already logged out
      router.push('/auth/login');
    }
  };

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '?';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = user?.user_metadata?.full_name as string | undefined;
  const email = user?.email;

  return (
    <Menu shadow="md" width={240} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" radius="xl" size="lg">
          {avatarUrl ? (
            <Avatar src={avatarUrl} size={28} radius="xl" />
          ) : (
            <Avatar color="blue" radius="xl" size={28}>
              {initials}
            </Avatar>
          )}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {displayName && (
          <Menu.Label>
            <Text size="xs" fw={500} truncate>
              {displayName}
            </Text>
          </Menu.Label>
        )}
        {email && (
          <Menu.Label>
            <Text size="xs" c="dimmed" truncate>
              {email}
            </Text>
          </Menu.Label>
        )}

        <Menu.Divider />

        <Menu.Item
          leftSection={
            colorScheme === 'dark' ? (
              <IconSun size={16} stroke={1.5} />
            ) : (
              <IconMoon size={16} stroke={1.5} />
            )
          }
          onClick={toggleColorScheme}
        >
          {colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconLogout size={16} stroke={1.5} />}
          color="red"
          onClick={handleLogout}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>SpecFlow Lite</Title>
          </Group>
          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
