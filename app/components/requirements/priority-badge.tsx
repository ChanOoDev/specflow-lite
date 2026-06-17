'use client';

import { Badge } from '@mantine/core';

const PRIORITY_COLORS: Record<string, string> = {
  p1: 'red',
  p2: 'orange',
  p3: 'yellow',
  p4: 'blue',
  p5: 'gray',
};

const PRIORITY_LABELS: Record<string, string> = {
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
  p4: 'P4',
  p5: 'P5',
};

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge color={PRIORITY_COLORS[priority] ?? 'gray'} variant="outline">
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}
