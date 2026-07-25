'use client';

import { NavLink, Stack } from '@mantine/core';
import {
  IconLayoutDashboard,
  IconFolders,
  IconSearch,
  IconInfoCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: IconLayoutDashboard },
  { label: 'Projects', href: '/projects', icon: IconFolders },
];

const META_ITEMS = [
  { label: 'Search', href: '/search', icon: IconSearch },
  { label: 'Project Info', href: '/project-info', icon: IconInfoCircle },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <Stack gap={4}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          label={item.label}
          leftSection={<item.icon size={18} stroke={1.5} />}
          active={
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href + '/'))
          }
          variant="subtle"
          styles={{
            root: {
              borderRadius: 'var(--mantine-radius-md)',
            },
            label: {
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        />
      ))}
      <Stack gap={4} mt="md">
        {META_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            leftSection={<item.icon size={18} stroke={1.5} />}
            active={pathname === item.href}
            variant="subtle"
            styles={{
              root: {
                borderRadius: 'var(--mantine-radius-md)',
              },
              label: {
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
