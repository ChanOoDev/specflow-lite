'use client';

import { Modal, Stack, Text, TextInput, Button, Group, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

interface DeleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  opened,
  onClose,
  onConfirm,
  projectName,
  loading = false,
}: DeleteConfirmModalProps) {
  const [typed, setTyped] = useState('');
  const confirmed = typed === projectName;

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm();
      setTyped('');
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Delete Project" centered>
      <Stack>
        <Alert color="red" icon={<IconAlertTriangle size={20} />}>
          This action cannot be undone. The project will be soft-deleted and permanently removed after 30 days.
        </Alert>

        <Text size="sm">
          Type <strong>{projectName}</strong> to confirm deletion:
        </Text>

        <TextInput
          placeholder={projectName}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleConfirm}
            disabled={!confirmed}
            loading={loading}
          >
            Delete Project
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
