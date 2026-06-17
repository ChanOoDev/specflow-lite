'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardResponse } from '@/lib/types/dashboard';

async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Failed to fetch dashboard data');
  }
  return res.json();
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30 * 1000,
  });
}
