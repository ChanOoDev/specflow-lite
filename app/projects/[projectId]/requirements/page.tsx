'use client';

import { Container, Stack, Title } from '@mantine/core';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { RequirementList } from '@/app/components/requirements/requirement-list';
import { RequirementListSkeleton } from '@/app/components/requirements/requirement-list-skeleton';
import { useRequirements } from '@/lib/hooks/use-requirements';
import { useState, useCallback, Suspense } from 'react';

function RequirementsPageContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [type, setType] = useState(searchParams.get('type') ?? '');
  const [priority, setPriority] = useState(searchParams.get('priority') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const { data, isLoading, isError } = useRequirements(projectId, {
    search: search || undefined,
    type: (type as never) || undefined,
    priority: (priority as never) || undefined,
    status: (status as never) || undefined,
    page,
    pageSize: 20,
  });

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`/projects/${projectId}/requirements?${params.toString()}`);
    },
    [projectId, searchParams, router]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      updateParams({ search: value, page: '' });
    },
    [updateParams]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      setType(value);
      updateParams({ type: value, page: '' });
    },
    [updateParams]
  );

  const handlePriorityChange = useCallback(
    (value: string) => {
      setPriority(value);
      updateParams({ priority: value, page: '' });
    },
    [updateParams]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value);
      updateParams({ status: value, page: '' });
    },
    [updateParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: String(newPage) });
    },
    [updateParams]
  );

  if (isLoading) {
    return <RequirementListSkeleton />;
  }

  return (
    <Container size="lg" py="md">
      <Stack>
        <Title order={2}>Requirements</Title>

        <RequirementList
          requirements={data?.data ?? []}
          totalPages={data?.pagination.totalPages ?? 1}
          page={page}
          projectId={projectId}
          search={search}
          type={type}
          priority={priority}
          status={status}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
          onPriorityChange={handlePriorityChange}
          onStatusChange={handleStatusChange}
          onPageChange={handlePageChange}
        />
      </Stack>
    </Container>
  );
}

export default function RequirementsPage() {
  return (
    <Suspense fallback={<RequirementListSkeleton />}>
      <RequirementsPageContent />
    </Suspense>
  );
}
