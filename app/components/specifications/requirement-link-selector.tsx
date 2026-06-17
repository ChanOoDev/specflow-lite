'use client';

import { MultiSelect, Text, Stack } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

interface ApprovedRequirement {
  value: string;
  label: string;
}

async function fetchApprovedRequirements(
  projectId: string
): Promise<ApprovedRequirement[]> {
  const params = new URLSearchParams({ status: 'approved', pageSize: '50' });
  const res = await fetch(
    `/api/projects/${projectId}/requirements?${params.toString()}`
  );
  if (!res.ok) return [];
  const body = await res.json();
  return (body.data ?? []).map((r: { id: string; title: string }) => ({
    value: r.id,
    label: r.title,
  }));
}

interface RequirementLinkSelectorProps {
  projectId: string;
  value: string[];
  onChange: (value: string[]) => void;
  /** Is the form in create mode vs edit mode */
  mode?: 'create' | 'edit';
}

export function RequirementLinkSelector({
  projectId,
  value,
  onChange,
  mode = 'create',
}: RequirementLinkSelectorProps) {
  const { data: options = [], isLoading } = useQuery({
    queryKey: ['projects', projectId, 'requirements', 'approved'],
    queryFn: () => fetchApprovedRequirements(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          Link Requirements
        </Text>
        <MultiSelect
          data={[]}
          value={value}
          onChange={onChange}
          placeholder="Loading approved requirements..."
          searchable
          disabled
        />
      </Stack>
    );
  }

  if (options.length === 0 && mode === 'create') {
    return (
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          Link Requirements
        </Text>
        <Text size="xs" c="dimmed">
          No approved requirements available. Approve requirements first to
          link them to this specification.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap={4}>
      <Text size="sm" fw={500}>
        Link Requirements
      </Text>
      <Text size="xs" c="dimmed">
        Select approved requirements to link to this specification.
      </Text>
      <MultiSelect
        data={options}
        value={value}
        onChange={onChange}
        placeholder="Select requirements to link..."
        searchable
        clearable
        nothingFoundMessage="No approved requirements found"
      />
    </Stack>
  );
}
