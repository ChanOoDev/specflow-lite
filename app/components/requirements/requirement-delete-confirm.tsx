'use client';

import { Modal, Text, Stack, TextInput, Button, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface RequirementDeleteConfirmProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requirementTitle: string;
  loading?: boolean;
}

export function RequirementDeleteConfirm({
  opened,
  onClose,
  onConfirm,
  requirementTitle,
  loading = false,
}: RequirementDeleteConfirmProps) {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (opened) {
      setInput('');
    }
  }, [opened]);

  const confirmed = input === requirementTitle;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Requirement"
      centered
    >
      <Stack>
        <Text size="sm">
          This will permanently delete the requirement and all associated data.
          This action can be reversed within 30 days.
        </Text>
        <Text size="sm" fw={700}>
          Type &quot;{requirementTitle}&quot; to confirm:
        </Text>
        <TextInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={requirementTitle}
          autoFocus
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={18} />}
            onClick={onConfirm}
            disabled={!confirmed}
            loading={loading}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
