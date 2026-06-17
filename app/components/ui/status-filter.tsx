'use client';

import { Select } from '@mantine/core';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Select
      data={STATUS_OPTIONS}
      value={value}
      onChange={(val) => onChange(val ?? '')}
      w={{ base: '100%', sm: 180 }}
      size="sm"
      placeholder="Filter by status"
    />
  );
}
