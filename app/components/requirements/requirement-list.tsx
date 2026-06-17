'use client';

import { useState, useCallback } from 'react';
import { SimpleGrid, Group, Pagination, Button, Select, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { RequirementCard } from './requirement-card';
import { RequirementEmptyState } from './requirement-empty-state';
import { SearchInput } from '../ui/search-input';
import type { Requirement } from '@/lib/types/requirement';
import Link from 'next/link';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'functional', label: 'Functional' },
  { value: 'non_functional', label: 'Non-Functional' },
  { value: 'technical', label: 'Technical' },
  { value: 'ux', label: 'UX' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'p1', label: 'P1' },
  { value: 'p2', label: 'P2' },
  { value: 'p3', label: 'P3' },
  { value: 'p4', label: 'P4' },
  { value: 'p5', label: 'P5' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'deferred', label: 'Deferred' },
];

interface RequirementListProps {
  requirements: Requirement[];
  totalPages: number;
  page: number;
  projectId: string;
  search: string;
  type: string;
  priority: string;
  status: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export function RequirementList({
  requirements,
  totalPages,
  page,
  projectId,
  search,
  type,
  priority,
  status,
  onSearchChange,
  onTypeChange,
  onPriorityChange,
  onStatusChange,
  onPageChange,
}: RequirementListProps) {
  const hasFilters = !!(search || type || priority || status);

  if (requirements.length === 0 && !hasFilters) {
    return <RequirementEmptyState projectId={projectId} />;
  }

  return (
    <Stack>
      <Group justify="space-between" wrap="wrap">
        <Group wrap="wrap">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search requirements..."
          />
          <Select
            data={TYPE_OPTIONS}
            value={type}
            onChange={(val) => onTypeChange(val ?? '')}
            w={{ base: '100%', sm: 160 }}
            size="sm"
            placeholder="Filter by type"
          />
          <Select
            data={PRIORITY_OPTIONS}
            value={priority}
            onChange={(val) => onPriorityChange(val ?? '')}
            w={{ base: '100%', sm: 140 }}
            size="sm"
            placeholder="Filter by priority"
          />
          <Select
            data={STATUS_OPTIONS}
            value={status}
            onChange={(val) => onStatusChange(val ?? '')}
            w={{ base: '100%', sm: 160 }}
            size="sm"
            placeholder="Filter by status"
          />
        </Group>
        <Button
          component={Link}
          href={`/projects/${projectId}/requirements/new`}
          leftSection={<IconPlus size={18} />}
        >
          New Requirement
        </Button>
      </Group>

      {requirements.length === 0 ? (
        <RequirementEmptyState projectId={projectId} hasFilters />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {requirements.map((r) => (
              <RequirementCard
                key={r.id}
                requirement={r}
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
