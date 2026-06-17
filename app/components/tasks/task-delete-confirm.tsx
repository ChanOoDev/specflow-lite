'use client';

import { useState } from 'react';
import { Modal, Text, TextInput, Button, Group, Stack, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface TaskDeleteConfirmProps {
  taskTitle: string;
  opened: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TaskDeleteConfirm({
  taskTitle,
  opened,
  loading = false,
  onClose,
  onConfirm,
}: TaskDeleteConfirmProps) {
  const [typedTitle, setTypedTitle] = useState('');

  const canConfirm = typedTitle.trim() === taskTitle;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        setTypedTitle('');
        onClose();
      }}
      title="Delete Task"
      centered
    >
      <Stack gap="md">
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertTriangle size={16} />}
        >
          <Text size="sm">
            This will permanently delete this task. This action can be
            undone within 30 days.
          </Text>
        </Alert>

        <Text size="sm">
          Type <strong>{taskTitle}</strong> to confirm:
        </Text>

        <TextInput
          placeholder="Type task title to confirm"
          value={typedTitle}
          onChange={(e) => setTypedTitle(e.currentTarget.value)}
        />

        <Group justify="flex-end">
          <Button
            variant="subtle"
            onClick={() => {
              setTypedTitle('');
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            color="red"
            disabled={!canConfirm}
            loading={loading}
            onClick={() => {
              onConfirm();
              setTypedTitle('');
            }}
          >
            Delete Task
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
