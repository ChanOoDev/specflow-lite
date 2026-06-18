'use client';

import { NavLink, Stack, Divider } from '@mantine/core';
import { IconLayoutDashboard, IconFolders, IconInfoCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: IconLayoutDashboard },
  { label: 'Projects', href: '/projects', icon: IconFolders },
];

const META_ITEMS = [
  { label: 'Project Info', href: '/project-info', icon: IconInfoCircle },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <Stack gap="xs">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          label={item.label}
          leftSection={<item.icon size={20} stroke={1.5} />}
          active={pathname === item.href || pathname.startsWith(item.href + '/')}
          variant="light"
        />
      ))}
      <Divider my="xs" />
      {META_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          label={item.label}
          leftSection={<item.icon size={20} stroke={1.5} />}
          active={pathname === item.href}
          variant="light"
        />
      ))}
    </Stack>
  );
}
