'use client';

import { Badge } from '@mantine/core';

const STATUS_COLORS: Record<string, string> = {
  todo: 'gray',
  in_progress: 'blue',
  done: 'green',
};

interface TaskStatusBadgeProps {
  status: string;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const display = status.replace(/_/g, ' ');
  return (
    <Badge color={STATUS_COLORS[status] ?? 'gray'} variant="light">
      {display}
    </Badge>
  );
}
