'use client';

import { Badge } from '@mantine/core';

const PRIORITY_COLORS: Record<string, string> = {
  p1: 'red',
  p2: 'orange',
  p3: 'warm',
  p4: 'sage',
  p5: 'gray',
};

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge color={PRIORITY_COLORS[priority] ?? 'gray'} variant="outline">
      {priority.toUpperCase()}
    </Badge>
  );
}
