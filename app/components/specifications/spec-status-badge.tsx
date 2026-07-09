'use client';

import { Badge } from '@mantine/core';

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  in_progress: 'sage',
  completed: 'green',
  approved: 'slate',
  archived: 'warm',
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
