'use client';

import { useForm, schemaResolver } from '@mantine/form';
import { TextInput, Textarea, Button, Stack, Select, Alert } from '@mantine/core';
import { z } from 'zod/v4';

const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Project name is required' })
    .max(120, { error: 'Project name must be 120 characters or fewer' }),
  description: z
    .string()
    .max(2000, { error: 'Description must be 2000 characters or fewer' })
    .default(''),
});

export interface ProjectFormValues {
  name: string;
  description: string;
  status?: string;
}

interface ProjectFormProps {
  initialValues?: {
    name: string;
    description: string;
  };
  /** Current project status — only needed in edit mode */
  currentStatus?: string;
  /** Allowed status transitions for the current status */
  allowedTransitions?: string[];
  onSubmit: (values: ProjectFormValues) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
}

export function ProjectForm({
  initialValues = { name: '', description: '' },
  currentStatus,
  allowedTransitions,
  onSubmit,
  submitLabel = 'Create Project',
  loading = false,
  error,
}: ProjectFormProps) {
  const form = useForm({
    initialValues: {
      ...initialValues,
      status: currentStatus ?? '',
    },
    validate: schemaResolver(projectFormSchema, { sync: true }),
  });

  const statusOptions =
    allowedTransitions?.map((s) => ({
      value: s,
      label: s.charAt(0).toUpperCase() + s.slice(1),
    })) ?? [];

  const isEditMode = !!currentStatus && allowedTransitions && allowedTransitions.length > 0;

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        const payload: ProjectFormValues = {
          name: values.name,
          description: values.description,
        };
        if (isEditMode && values.status && values.status !== currentStatus) {
          payload.status = values.status;
        }
        onSubmit(payload);
      })}
    >
      <Stack>
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <TextInput
          label="Project Name"
          placeholder="My Project"
          withAsterisk
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description"
          placeholder="Optional description..."
          minRows={3}
          autosize
          maxRows={8}
          {...form.getInputProps('description')}
        />

        {isEditMode && (
          <Select
            label="Status"
            description={`Current: ${currentStatus}`}
            data={statusOptions}
            {...form.getInputProps('status')}
          />
        )}

        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
