'use client';

import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Badge,
  Card,
  Skeleton,
  Center,
  TextInput,
  ActionIcon,
  Anchor,
} from '@mantine/core';
import { IconSearch, IconX, IconFileDescription, IconListCheck, IconFolder } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { AppShellLayout } from '@/app/components/layout/app-shell';

interface SearchResult {
  id: string;
  type: 'project' | 'requirement' | 'specification';
  title: string;
  description: string | null;
  project_id: string;
  project_name: string | null;
  url: string;
  updated_at: string;
}

const TYPE_ICONS = {
  project: IconFolder,
  requirement: IconFileDescription,
  specification: IconListCheck,
};

const TYPE_COLORS: Record<string, string> = {
  project: 'blue',
  requirement: 'violet',
  specification: 'teal',
};

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const trimmed = value.trim();
        if (trimmed.length >= 2) {
          router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
          performSearch(trimmed);
        } else {
          setResults([]);
          setSearched(false);
          if (!trimmed) router.replace('/search', { scroll: false });
        }
      }, 300);
    },
    [router, performSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSearched(false);
    router.replace('/search', { scroll: false });
  }, [router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') handleClear();
      if (e.key === 'Enter' && query.trim().length >= 2) {
        router.replace(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
        performSearch(query.trim());
      }
    },
    [query, router, performSearch, handleClear]
  );

  return (
    <AppShellLayout>
      <Container size="md" py="md">
        <Stack>
          <Title order={2}>Search</Title>
          <TextInput
            placeholder="Search projects, requirements, specifications…"
            leftSection={<IconSearch size={18} stroke={1.5} />}
            rightSection={
              query ? (
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleClear} aria-label="Clear search">
                  <IconX size={14} />
                </ActionIcon>
              ) : undefined
            }
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            size="md"
            autoFocus
            aria-label="Search input"
          />

          {loading && (
            <Stack>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h={80} radius="md" />
              ))}
            </Stack>
          )}

          {!loading && searched && results.length === 0 && query.trim().length >= 2 && (
            <Paper radius="md" p="xl" withBorder>
              <Center>
                <Stack align="center" gap="xs">
                  <IconSearch size={32} stroke={1.5} color="var(--mantine-color-dimmed)" />
                  <Text c="dimmed" size="lg">
                    No results found for &ldquo;{query.trim()}&rdquo;
                  </Text>
                  <Text size="sm" c="dimmed">
                    Try different keywords or check your spelling.
                  </Text>
                </Stack>
              </Center>
            </Paper>
          )}

          {!loading && results.length > 0 && (
            <>
              <Text size="sm" c="dimmed">
                {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query.trim()}&rdquo;
              </Text>
              <Stack gap="sm">
                {results.map((result) => {
                  const Icon = TYPE_ICONS[result.type];
                  return (
                    <Card
                      key={`${result.type}-${result.id}`}
                      shadow="xs"
                      padding="md"
                      radius="md"
                      withBorder
                      component={Link}
                      href={result.url}
                      className="hover-lift"
                      style={{ cursor: 'pointer' }}
                    >
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Icon size={16} stroke={1.5} />
                            <Text fw={600} size="sm" lineClamp={1}>
                              {result.title}
                            </Text>
                          </Group>
                          {result.description && (
                            <Text size="xs" c="dimmed" lineClamp={2}>
                              {result.description}
                            </Text>
                          )}
                          <Group gap="xs">
                            <Badge size="xs" color={TYPE_COLORS[result.type]} variant="light">
                              {result.type}
                            </Badge>
                            {result.project_name && result.type !== 'project' && (
                              <Text
                                component="span"
                                size="xs"
                                c="dimmed"
                              >
                                {result.project_name}
                              </Text>
                            )}
                          </Group>
                        </Stack>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </>
          )}

          {!loading && !searched && (
            <Paper radius="md" p="xl" withBorder>
              <Center>
                <Stack align="center" gap="xs">
                  <IconSearch size={40} stroke={1} color="var(--mantine-color-dimmed)" />
                  <Text c="dimmed" size="lg">
                    Search across all your projects
                  </Text>
                  <Text size="sm" c="dimmed">
                    Type at least 2 characters to start searching.
                  </Text>
                </Stack>
              </Center>
            </Paper>
          )}
        </Stack>
      </Container>
    </AppShellLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Container size="md" py="md"><Skeleton height={400} radius="md" /></Container>}>
      <SearchPageContent />
    </Suspense>
  );
}
