'use client';

import { Container, Stack, Title, Button, Group, Center, Text, Paper } from '@mantine/core';
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import { useRecentProjects } from '@/lib/hooks/use-recent-projects';
import { SummaryCards } from './summary-cards';
import { RecentProjects } from './recent-projects';
import { OpenTasks } from './open-tasks';
import { DashboardEmpty } from './dashboard-empty';
import { DashboardSkeleton } from './dashboard-skeleton';

export function DashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();
  const { recentProjects } = useRecentProjects();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <Container size="md" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <IconAlertCircle size={40} stroke={1.5} color="var(--mantine-color-red-6)" />
              <Title order={3}>Unable to Load Dashboard</Title>
              <Text c="dimmed" ta="center">
                Something went wrong while fetching your dashboard data. Please try again.
              </Text>
              <Button
                variant="subtle"
                leftSection={<IconRefresh size={18} />}
                onClick={() => refetch()}
                loading={isFetching}
              >
                Retry
              </Button>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  // Empty state: user has no projects
  if (!data || data.summary.totalProjects === 0) {
    return <DashboardEmpty />;
  }

  // Enrich recent projects with status from dashboard data
  const projectStatusMap = new Map(
    data.projects.map((p) => [p.id, p.status])
  );
  const enrichedRecents = recentProjects.map((rp) => ({
    ...rp,
    status: projectStatusMap.get(rp.projectId),
  }));

  return (
    <Container size="md" py="md">
      <Stack gap="lg">
        <Group justify="space-between" wrap="wrap">
          <Title order={2}>Dashboard</Title>
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={18} />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Refresh
          </Button>
        </Group>

        <SummaryCards summary={data.summary} />

        <RecentProjects projects={enrichedRecents} />

        <OpenTasks tasks={data.openTasks} totalProjects={data.summary.totalProjects} />
      </Stack>
    </Container>
  );
}
