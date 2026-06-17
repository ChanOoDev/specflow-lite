'use client';

import { useForm, schemaResolver } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Select,
  Alert,
} from '@mantine/core';
import { z } from 'zod/v4';
import { RequirementLinkSelector } from './requirement-link-selector';
import type { LinkedRequirement } from '@/lib/types/specification';

const specificationFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Title is required' })
    .max(200, { error: 'Title must be 200 characters or fewer' }),
  description: z
    .string()
    .max(5000, { error: 'Description must be 5000 characters or fewer' })
    .default(''),
  status: z.string().optional(),
});

export interface SpecificationFormValues {
  title: string;
  description: string;
  status?: string;
  linkedRequirementIds?: string[];
}

interface SpecificationFormProps {
  projectId: string;
  initialValues?: {
    title: string;
    description: string;
  };
  /** Current specification status — only needed in edit mode */
  currentStatus?: string;
  /** Allowed status transitions for the current status */
  allowedTransitions?: string[];
  /** Currently linked requirement IDs (edit mode) */
  currentLinkedRequirementIds?: string[];
  /** Currently linked requirements (edit mode detail) */
  currentLinkedRequirements?: LinkedRequirement[];
  onSubmit: (values: SpecificationFormValues) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
  /** Hide requirement linking (only used on create) */
  hideRequirementLinking?: boolean;
}

export function SpecificationForm({
  projectId,
  initialValues = { title: '', description: '' },
  currentStatus,
  allowedTransitions,
  currentLinkedRequirementIds,
  onSubmit,
  submitLabel = 'Create Specification',
  loading = false,
  error,
}: SpecificationFormProps) {
  const form = useForm({
    initialValues: {
      ...initialValues,
      status: currentStatus ?? '',
      linkedRequirementIds: currentLinkedRequirementIds ?? [],
    },
    validate: schemaResolver(specificationFormSchema, { sync: true }),
  });

  const statusOptions =
    allowedTransitions?.map((s) => ({
      value: s,
      label: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    })) ?? [];

  const isEditMode =
    !!currentStatus && !!allowedTransitions && allowedTransitions.length > 0;

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        const payload: SpecificationFormValues = {
          title: values.title,
          description: values.description,
          linkedRequirementIds: values.linkedRequirementIds ?? [],
        };
        if (isEditMode && values.status && values.status !== currentStatus) {
          payload.status = values.status;
        }
        onSubmit(payload);
      })}
    >
      <Stack>
        <TextInput
          label="Title"
          placeholder="Specification title"
          withAsterisk
          {...form.getInputProps('title')}
        />

        <Textarea
          label="Description"
          placeholder="Optional description..."
          minRows={4}
          autosize
          maxRows={12}
          {...form.getInputProps('description')}
        />

        <RequirementLinkSelector
          projectId={projectId}
          value={form.values.linkedRequirementIds ?? []}
          onChange={(val) => form.setFieldValue('linkedRequirementIds', val)}
          mode={isEditMode ? 'edit' : 'create'}
        />

        {isEditMode && (
          <Select
            label="Status"
            description={`Current: ${
              currentStatus?.replace(/_/g, ' ') ?? ''
            }`}
            data={statusOptions}
            {...form.getInputProps('status')}
          />
        )}

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
