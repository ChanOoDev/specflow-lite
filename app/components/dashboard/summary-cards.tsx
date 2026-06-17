'use client';

import { SimpleGrid, Card, Stack, Text, Group, Badge } from '@mantine/core';
import {
  IconFolders,
  IconFileText,
  IconListCheck,
  IconCheckbox,
} from '@tabler/icons-react';
import type { DashboardSummary } from '@/lib/types/dashboard';

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Projects',
      value: summary.totalProjects,
      icon: IconFolders,
      color: 'blue',
    },
    {
      label: 'Requirements',
      value: summary.totalRequirements,
      icon: IconFileText,
      color: 'violet',
    },
    {
      label: 'Specifications',
      value: summary.totalSpecifications,
      icon: IconListCheck,
      color: 'teal',
    },
    {
      label: 'Tasks',
      value: (
        <Group gap={4} justify="center" wrap="nowrap">
          <Badge size="xs" variant="light" color="orange">
            {summary.tasksByStatus.todo}
          </Badge>
          <Badge size="xs" variant="light" color="blue">
            {summary.tasksByStatus.in_progress}
          </Badge>
          <Badge size="xs" variant="light" color="green">
            {summary.tasksByStatus.done}
          </Badge>
        </Group>
      ),
      icon: IconCheckbox,
      color: 'orange',
      isStatusCard: true,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }}>
      {cards.map((card) => (
        <Card key={card.label} shadow="sm" padding="md" radius="md" withBorder>
          <Stack align="center" gap="xs">
            <card.icon size={24} stroke={1.5} color={`var(--mantine-color-${card.color}-6)`} />
            {card.isStatusCard ? (
              <>{card.value}</>
            ) : (
              <Text size="xl" fw={700}>
                {card.value}
              </Text>
            )}
            <Text size="xs" c="dimmed">
              {card.label}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
