import { Badge } from '@mantine/core';

const STATUS_COLORS: Record<string, string> = {
  active: 'green',
  paused: 'warm',
  completed: 'sage',
  archived: 'slate',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge color={STATUS_COLORS[status] ?? 'gray'} variant="light">
      {status}
    </Badge>
  );
}
