'use client';

import { Modal, Text, Stack, TextInput, Button, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface SpecificationDeleteConfirmProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  specificationTitle: string;
  loading?: boolean;
}

export function SpecificationDeleteConfirm({
  opened,
  onClose,
  onConfirm,
  specificationTitle,
  loading = false,
}: SpecificationDeleteConfirmProps) {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (opened) {
      setInput('');
    }
  }, [opened]);

  const confirmed = input === specificationTitle;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Specification"
      centered
    >
      <Stack>
        <Text size="sm">
          This will permanently delete the specification. Linked requirements
          will be unlinked but not deleted. This action can be reversed within
          30 days.
        </Text>
        <Text size="sm" fw={700}>
          Type &quot;{specificationTitle}&quot; to confirm:
        </Text>
        <TextInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={specificationTitle}
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
