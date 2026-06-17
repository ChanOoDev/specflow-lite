'use client';

import { Container, Group, Button, Badge, Skeleton, Text } from '@mantine/core';
import { IconLayoutDashboard, IconFileText, IconListCheck } from '@tabler/icons-react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useProject } from '@/lib/hooks/use-project';
import { useRecentProjects } from '@/lib/hooks/use-recent-projects';
import { useEffect, useRef } from 'react';

function ProjectSubNav() {
  const { projectId } = useParams<{ projectId: string }>();
  const pathname = usePathname();
  const { data: project, isLoading } = useProject(projectId);
  const { trackProjectAccess } = useRecentProjects();
  const trackedRef = useRef<string | null>(null);

  // Track recent project access when project data loads
  useEffect(() => {
    if (project && project.id !== trackedRef.current) {
      trackedRef.current = project.id;
      trackProjectAccess(project.id, project.name);
    }
  }, [project, trackProjectAccess]);

  const base = `/projects/${projectId}`;

  const tabs = [
    {
      label: 'Overview',
      href: base,
      icon: IconLayoutDashboard,
      active: pathname === base,
      badge: null,
    },
    {
      label: 'Requirements',
      href: `${base}/requirements`,
      icon: IconFileText,
      active: pathname.startsWith(`${base}/requirements`),
      badge: isLoading ? null : project?.counts?.requirements ?? 0,
    },
    {
      label: 'Specifications',
      href: `${base}/specifications`,
      icon: IconListCheck,
      active: pathname.startsWith(`${base}/specifications`),
      badge: isLoading ? null : project?.counts?.specifications ?? 0,
    },
  ];

  return (
    <Container size="lg" py="xs">
      <Group gap="xs" wrap="nowrap">
        {tabs.map((tab) => (
          <Button
            key={tab.href}
            component={Link}
            href={tab.href}
            variant={tab.active ? 'light' : 'subtle'}
            size="sm"
            leftSection={<tab.icon size={16} />}
            rightSection={
              tab.badge !== null && tab.badge !== undefined ? (
                <Badge size="xs" variant="outline" color={tab.active ? 'blue' : 'gray'}>
                  {tab.badge}
                </Badge>
              ) : undefined
            }
          >
            {tab.label}
          </Button>
        ))}
      </Group>
    </Container>
  );
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProjectSubNav />
      {children}
    </>
  );
}
