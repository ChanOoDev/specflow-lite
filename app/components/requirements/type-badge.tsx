'use client';

import { Badge } from '@mantine/core';

const TYPE_COLORS: Record<string, string> = {
  functional: 'blue',
  non_functional: 'violet',
  technical: 'gray',
  ux: 'pink',
};

const TYPE_LABELS: Record<string, string> = {
  functional: 'Functional',
  non_functional: 'Non-Functional',
  technical: 'Technical',
  ux: 'UX',
};

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <Badge color={TYPE_COLORS[type] ?? 'gray'} variant="light">
      {TYPE_LABELS[type] ?? type}
    </Badge>
  );
}
