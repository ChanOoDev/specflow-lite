'use client';

import { useProjects } from '@/lib/hooks/use-projects';
import { ProjectList } from '@/app/components/projects/project-list';
import { ProjectListSkeleton } from '@/app/components/projects/project-list-skeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, Suspense } from 'react';

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const search = searchParams.get('search') ?? '';
  const statusRaw = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page') ?? '1');
  const includeArchived = searchParams.get('includeArchived') === 'true';

  const status = (statusRaw === 'active' || statusRaw === 'paused' || statusRaw === 'completed' || statusRaw === 'archived')
    ? statusRaw
    : undefined;

  const { data, isLoading } = useProjects({
    search: search || undefined,
    status,
    page,
    includeArchived,
  });

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`/projects?${params.toString()}`);
    },
    [searchParams, router]
  );

  if (isLoading) {
    return <ProjectListSkeleton />;
  }

  return (
    <ProjectList
      projects={data?.data ?? []}
      totalPages={data?.pagination.totalPages ?? 1}
      page={page}
      search={search}
      status={statusRaw}
      includeArchived={includeArchived}
      onSearchChange={(val) => updateParams({ search: val, page: '1' })}
      onStatusChange={(val) => updateParams({ status: val, page: '1' })}
      onPageChange={(pg) => updateParams({ page: String(pg) })}
      onIncludeArchivedToggle={() =>
        updateParams({
          includeArchived: includeArchived ? '' : 'true',
          page: '1',
        })
      }
    />
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectListSkeleton />}>
      <ProjectsPageContent />
    </Suspense>
  );
}
