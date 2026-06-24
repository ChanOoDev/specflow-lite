'use client';

import { TextInput, ActionIcon } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useState, useRef, useCallback } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search projects...',
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = useCallback((val: string) => {
    setLocal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), 200);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setLocal('');
    onChange('');
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <TextInput
      placeholder={placeholder}
      leftSection={<IconSearch size={16} stroke={1.5} />}
      rightSection={
        local ? (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <IconX size={14} />
          </ActionIcon>
        ) : undefined
      }
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      onKeyDown={handleKeyDown}
      w={{ base: '100%', sm: 300 }}
      size="sm"
    />
  );
}
