'use client';

import { AppShell, Burger, Group, Title, Menu, ActionIcon, Avatar, Text, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUser, IconLogout, IconMoon, IconSun } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { Navbar } from './navbar';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

function UserMenu() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [clientError, setClientError] = useState(false);

  useEffect(() => {
    // Check guest mode first
    const guestCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('guest-mode='));
    if (guestCookie?.split('=')[1] === 'true') {
      setIsGuest(true);
      return;
    }

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
      if (isGuest) {
        // Clear guest cookie
        document.cookie = 'guest-mode=; path=/; max-age=0';
        window.location.href = '/auth/login';
        return;
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/auth/login';
    } catch {
      window.location.href = '/auth/login';
    }
  };

  const initials = isGuest
    ? '👤'
    : user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '?';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = isGuest ? 'Guest' : (user?.user_metadata?.full_name as string | undefined);
  const email = isGuest ? 'Browsing as guest' : user?.email;

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
          {isGuest ? 'Exit Guest Mode' : 'Sign out'}
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
