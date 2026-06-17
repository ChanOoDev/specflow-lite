'use client';

import { SimpleGrid, Group, Pagination, Button, Select, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { SpecificationCard } from './specification-card';
import { SpecificationEmptyState } from './specification-empty-state';
import { SearchInput } from '../ui/search-input';
import type { Specification } from '@/lib/types/specification';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
];

interface SpecificationListProps {
  specifications: Specification[];
  totalPages: number;
  page: number;
  projectId: string;
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export function SpecificationList({
  specifications,
  totalPages,
  page,
  projectId,
  search,
  status,
  onSearchChange,
  onStatusChange,
  onPageChange,
}: SpecificationListProps) {
  const hasFilters = !!(search || status);

  if (specifications.length === 0 && !hasFilters) {
    return <SpecificationEmptyState projectId={projectId} />;
  }

  return (
    <Stack>
      <Group justify="space-between" wrap="wrap">
        <Group wrap="wrap">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search specifications..."
          />
          <Select
            data={STATUS_OPTIONS}
            value={status}
            onChange={(val) => onStatusChange(val ?? '')}
            w={{ base: '100%', sm: 180 }}
            size="sm"
            placeholder="Filter by status"
          />
        </Group>
        <Button
          component={Link}
          href={`/projects/${projectId}/specifications/new`}
          leftSection={<IconPlus size={18} />}
        >
          New Specification
        </Button>
      </Group>

      {specifications.length === 0 ? (
        <SpecificationEmptyState projectId={projectId} hasFilters />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {specifications.map((s) => (
              <SpecificationCard
                key={s.id}
                specification={s}
                projectId={projectId}
              />
            ))}
          </SimpleGrid>

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                total={totalPages}
                value={page}
                onChange={onPageChange}
              />
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}
