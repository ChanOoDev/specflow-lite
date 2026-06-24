'use client';

import { Container, Tabs, Badge } from '@mantine/core';
import { IconLayoutDashboard, IconFileText, IconListCheck } from '@tabler/icons-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useProject } from '@/lib/hooks/use-project';
import { useRecentProjects } from '@/lib/hooks/use-recent-projects';
import { useEffect, useRef } from 'react';

function ProjectSubNav() {
  const { projectId } = useParams<{ projectId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const { trackProjectAccess } = useRecentProjects();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (project && project.id !== trackedRef.current) {
      trackedRef.current = project.id;
      trackProjectAccess(project.id, project.name);
    }
  }, [project, trackProjectAccess]);

  const base = `/projects/${projectId}`;

  const activeTab = pathname === base
    ? 'overview'
    : pathname.startsWith(`${base}/requirements`)
      ? 'requirements'
      : pathname.startsWith(`${base}/specifications`)
        ? 'specifications'
        : 'overview';

  return (
    <Container size="lg" py="xs">
      <Tabs
        value={activeTab}
        onChange={(value) => {
          if (value === 'overview') router.push(base);
          else if (value === 'requirements') router.push(`${base}/requirements`);
          else if (value === 'specifications') router.push(`${base}/specifications`);
        }}
        variant="outline"
      >
        <Tabs.List>
          <Tabs.Tab
            value="overview"
            leftSection={<IconLayoutDashboard size={16} />}
          >
            Overview
          </Tabs.Tab>
          <Tabs.Tab
            value="requirements"
            leftSection={<IconFileText size={16} />}
            rightSection={
              !isLoading && project?.counts?.requirements != null ? (
                <Badge size="xs" variant="light" color={activeTab === 'requirements' ? 'blue' : 'gray'} ml={4}>
                  {project.counts.requirements}
                </Badge>
              ) : undefined
            }
          >
            Requirements
          </Tabs.Tab>
          <Tabs.Tab
            value="specifications"
            leftSection={<IconListCheck size={16} />}
            rightSection={
              !isLoading && project?.counts?.specifications != null ? (
                <Badge size="xs" variant="light" color={activeTab === 'specifications' ? 'blue' : 'gray'} ml={4}>
                  {project.counts.specifications}
                </Badge>
              ) : undefined
            }
          >
            Specifications
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
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
