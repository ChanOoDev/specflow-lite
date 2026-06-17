'use client';

import { Badge } from '@mantine/core';

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  in_progress: 'blue',
  completed: 'green',
  approved: 'teal',
  archived: 'yellow',
};

interface SpecStatusBadgeProps {
  status: string;
}

export function SpecStatusBadge({ status }: SpecStatusBadgeProps) {
  const display = status.replace(/_/g, ' ');
  return (
    <Badge color={STATUS_COLORS[status] ?? 'gray'} variant="light">
      {display}
    </Badge>
  );
}
