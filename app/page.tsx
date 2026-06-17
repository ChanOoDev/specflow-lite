import { Suspense } from 'react';
import { AppShellLayout } from '@/app/components/layout/app-shell';
import { DashboardPage } from '@/app/components/dashboard/dashboard-page';
import { DashboardSkeleton } from '@/app/components/dashboard/dashboard-skeleton';

export default function RootPage() {
  return (
    <AppShellLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardPage />
      </Suspense>
    </AppShellLayout>
  );
}
