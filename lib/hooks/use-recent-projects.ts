'use client';

import { useState, useCallback, useEffect } from 'react';
import type { RecentProject } from '@/lib/types/dashboard';

const STORAGE_KEY = 'specflow_recent_projects';
const MAX_ENTRIES = 5;

function readFromStorage(): RecentProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e: unknown) =>
        e &&
        typeof e === 'object' &&
        typeof (e as RecentProject).projectId === 'string' &&
        typeof (e as RecentProject).projectName === 'string' &&
        typeof (e as RecentProject).lastAccessedAt === 'string'
    );
  } catch {
    return [];
  }
}

function writeToStorage(projects: RecentProject[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function useRecentProjects() {
  const [projects, setProjects] = useState<RecentProject[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setProjects(readFromStorage());
  }, []);

  const trackProjectAccess = useCallback(
    (projectId: string, projectName: string) => {
      setProjects((prev) => {
        // Remove existing entry for this project (dedup)
        const filtered = prev.filter((p) => p.projectId !== projectId);
        // Prepend new entry
        const next: RecentProject[] = [
          {
            projectId,
            projectName,
            lastAccessedAt: new Date().toISOString(),
          },
          ...filtered,
        ].slice(0, MAX_ENTRIES);
        writeToStorage(next);
        return next;
      });
    },
    []
  );

  return { recentProjects: projects, trackProjectAccess };
}
