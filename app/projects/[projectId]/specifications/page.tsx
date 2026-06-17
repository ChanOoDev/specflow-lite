'use client';

import { Container, Stack, Title } from '@mantine/core';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { SpecificationList } from '@/app/components/specifications/specification-list';
import { useSpecifications } from '@/lib/hooks/use-specifications';
import { useState, useCallback, Suspense } from 'react';

function SpecificationsPageContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const { data, isLoading, isError } = useSpecifications(projectId, {
    search: search || undefined,
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
      router.push(
        `/projects/${projectId}/specifications?${params.toString()}`
      );
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

  return (
    <Container size="lg" py="md">
      <Stack>
        <Title order={2}>Specifications</Title>

        <SpecificationList
          specifications={data?.data ?? []}
          totalPages={data?.pagination.totalPages ?? 1}
          page={page}
          projectId={projectId}
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPageChange={handlePageChange}
        />
      </Stack>
    </Container>
  );
}

export default function SpecificationsPage() {
  return (
    <Suspense
      fallback={
        <Container size="lg" py="md">
          <Stack>
            <Title order={2}>Specifications</Title>
          </Stack>
        </Container>
      }
    >
      <SpecificationsPageContent />
    </Suspense>
  );
}
