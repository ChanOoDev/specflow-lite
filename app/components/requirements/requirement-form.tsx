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

const requirementFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'Title is required' })
    .max(200, { error: 'Title must be 200 characters or fewer' }),
  description: z
    .string()
    .max(3000, { error: 'Description must be 3000 characters or fewer' })
    .default(''),
  type: z.enum(['functional', 'non_functional', 'technical', 'ux']),
  priority: z.enum(['p1', 'p2', 'p3', 'p4', 'p5']),
  status: z.string().optional(),
});

export interface RequirementFormValues {
  title: string;
  description: string;
  type: string;
  priority: string;
  status?: string;
}

interface RequirementFormProps {
  initialValues?: {
    title: string;
    description: string;
    type: string;
    priority: string;
    status?: string;
  };
  /** Current requirement status — only needed in edit mode */
  currentStatus?: string;
  /** Allowed status transitions for the current status */
  allowedTransitions?: string[];
  onSubmit: (values: RequirementFormValues) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
}

const TYPE_OPTIONS = [
  { value: 'functional', label: 'Functional' },
  { value: 'non_functional', label: 'Non-Functional' },
  { value: 'technical', label: 'Technical' },
  { value: 'ux', label: 'UX' },
];

const PRIORITY_OPTIONS = [
  { value: 'p1', label: 'P1 — Critical' },
  { value: 'p2', label: 'P2 — High' },
  { value: 'p3', label: 'P3 — Medium' },
  { value: 'p4', label: 'P4 — Low' },
  { value: 'p5', label: 'P5 — Nice to Have' },
];

export function RequirementForm({
  initialValues = { title: '', description: '', type: 'functional', priority: 'p3' },
  currentStatus,
  allowedTransitions,
  onSubmit,
  submitLabel = 'Create Requirement',
  loading = false,
  error,
}: RequirementFormProps) {
  const form = useForm({
    initialValues: {
      ...initialValues,
      status: currentStatus ?? '',
    },
    validate: schemaResolver(requirementFormSchema, { sync: true }),
  });

  const statusOptions =
    allowedTransitions?.map((s) => ({
      value: s,
      label: s.charAt(0).toUpperCase() + s.slice(1),
    })) ?? [];

  const isEditMode =
    !!currentStatus && !!allowedTransitions && allowedTransitions.length > 0;

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        const payload: RequirementFormValues = {
          title: values.title,
          description: values.description,
          type: values.type,
          priority: values.priority,
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
          placeholder="Requirement title"
          withAsterisk
          {...form.getInputProps('title')}
        />

        <Textarea
          label="Description"
          placeholder="Optional description..."
          minRows={3}
          autosize
          maxRows={8}
          {...form.getInputProps('description')}
        />

        <Select
          label="Type"
          withAsterisk
          data={TYPE_OPTIONS}
          {...form.getInputProps('type')}
        />

        <Select
          label="Priority"
          withAsterisk
          data={PRIORITY_OPTIONS}
          {...form.getInputProps('priority')}
        />

        {isEditMode && (
          <Select
            label="Status"
            description={`Current: ${currentStatus}`}
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
