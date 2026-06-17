'use client';

import { useState, useCallback } from 'react';
import { SimpleGrid, Group, Pagination, Button, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { ProjectCard } from './project-card';
import { EmptyState } from './empty-state';
import { SearchInput } from '../ui/search-input';
import { StatusFilter } from '../ui/status-filter';
import type { ProjectWithCounts } from '@/lib/types/project';
import Link from 'next/link';

interface ProjectListProps {
  projects: ProjectWithCounts[];
  totalPages: number;
  page: number;
  search: string;
  status: string;
  includeArchived: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onIncludeArchivedToggle: () => void;
}

export function ProjectList({
  projects,
  totalPages,
  page,
  search,
  status,
  includeArchived,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onIncludeArchivedToggle,
}: ProjectListProps) {
  if (projects.length === 0 && !search && !status && !includeArchived) {
    return <EmptyState />;
  }

  return (
    <Stack>
      <Group justify="space-between" wrap="wrap">
        <Group wrap="wrap">
          <SearchInput value={search} onChange={onSearchChange} />
          <StatusFilter value={status} onChange={onStatusChange} />
          <Button
            variant="subtle"
            size="sm"
            onClick={onIncludeArchivedToggle}
          >
            {includeArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        </Group>
        <Button
          component={Link}
          href="/projects/new"
          leftSection={<IconPlus size={18} />}
        >
          New Project
        </Button>
      </Group>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </SimpleGrid>

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination total={totalPages} value={page} onChange={onPageChange} />
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}
