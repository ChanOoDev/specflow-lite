import { AppShellLayout } from '@/app/components/layout/app-shell';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
