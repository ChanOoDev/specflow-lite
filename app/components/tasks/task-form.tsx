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
import type { TaskStatus } from '@/lib/constants/task';
import { ALLOWED_TRANSITIONS } from '@/lib/constants/task';

const taskFormSchema = z.object({
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
  position: z
    .number()
    .int()
    .min(1, { error: 'Position must be at least 1' })
    .optional(),
});

export interface TaskFormValues {
  title: string;
  description: string;
  status?: string;
  position?: number;
}

interface TaskFormProps {
  initialValues?: {
    title: string;
    description: string;
    position?: number;
  };
  /** Current task status — only needed in edit mode */
  currentStatus?: TaskStatus;
  /** Whether this is an edit form (shows status + position fields) */
  isEdit?: boolean;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
}

export function TaskForm({
  initialValues = { title: '', description: '' },
  currentStatus,
  isEdit = false,
  onSubmit,
  submitLabel = 'Create Task',
  loading = false,
  error,
}: TaskFormProps) {
  const form = useForm({
    initialValues: {
      title: initialValues.title,
      description: initialValues.description,
      status: currentStatus ?? '',
      position: initialValues.position ?? undefined,
    },
    validate: schemaResolver(taskFormSchema, { sync: true }),
  });

  const statusOptions =
    currentStatus && ALLOWED_TRANSITIONS[currentStatus]
      ? ALLOWED_TRANSITIONS[currentStatus].map((s) => ({
          value: s,
          label: s
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        }))
      : [];

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        const payload: TaskFormValues = {
          title: values.title,
          description: values.description,
        };
        if (isEdit && currentStatus && values.status && values.status !== currentStatus) {
          payload.status = values.status;
        }
        if (isEdit && values.position !== undefined && values.position !== initialValues.position) {
          payload.position = values.position;
        }
        onSubmit(payload);
      })}
    >
      <Stack>
        <TextInput
          label="Title"
          placeholder="Task title"
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

        {isEdit && currentStatus && statusOptions.length > 0 && (
          <Select
            label="Status"
            description={`Current: ${currentStatus.replace(/_/g, ' ')}`}
            data={statusOptions}
            {...form.getInputProps('status')}
          />
        )}

        {isEdit && (
          <TextInput
            label="Position"
            description="Change the display order (1 = first)"
            type="number"
            min={1}
            {...form.getInputProps('position')}
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
