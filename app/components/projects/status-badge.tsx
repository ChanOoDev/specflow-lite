import { Badge } from '@mantine/core';

const STATUS_COLORS: Record<string, string> = {
  active: 'green',
  paused: 'yellow',
  completed: 'blue',
  archived: 'gray',
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
