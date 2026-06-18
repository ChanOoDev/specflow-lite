import { createClient, getUser, isGuest } from '@/lib/supabase/server';
import { dashboardResponseSchema } from '@/lib/validators/dashboard';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getUser();
  const guest = await isGuest();
  if (!user && !guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase = await createClient();

  // 1. Fetch projects (non-deleted, non-archived). Guests see all, users see their own.
  let query = supabase
    .from('projects')
    .select('id, name, status, updated_at')
    .is('deleted_at', null)
    .neq('status', 'archived')
    .order('updated_at', { ascending: false })
    .limit(50);
  if (!guest) query = query.eq('owner_id', user!.id);
  const { data: projects, error: projectsError } = await query;

  if (projectsError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: projectsError.message },
      { status: 500 }
    );
  }

  const projectIds = (projects ?? []).map((p) => p.id);
  const projectNameMap = new Map((projects ?? []).map((p) => [p.id, p.name]));

  // Default empty state when user has no projects
  if (projectIds.length === 0) {
    return NextResponse.json({
      summary: {
        totalProjects: 0,
        totalRequirements: 0,
        totalSpecifications: 0,
        tasksByStatus: { todo: 0, in_progress: 0, done: 0 },
      },
      projects: [],
      openTasks: [],
    });
  }

  // 2. Aggregate requirement counts by project
  const { data: reqRows, error: reqError } = await supabase
    .from('requirements')
    .select('project_id')
    .in('project_id', projectIds)
    .is('deleted_at', null);

  if (reqError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: reqError.message },
      { status: 500 }
    );
  }

  // 3. Aggregate specification counts by project
  const { data: specRows, error: specError } = await supabase
    .from('specifications')
    .select('project_id')
    .in('project_id', projectIds)
    .is('deleted_at', null);

  if (specError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: specError.message },
      { status: 500 }
    );
  }

  // 4. Fetch all tasks for counting by status and per-project counts
  const { data: taskRows, error: taskError } = await supabase
    .from('tasks')
    .select('project_id, status')
    .in('project_id', projectIds)
    .is('deleted_at', null);

  if (taskError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: taskError.message },
      { status: 500 }
    );
  }

  // 5. Fetch open tasks (todo + in_progress) for display, limited to 10
  const { data: openTaskRows, error: openTaskError } = await supabase
    .from('tasks')
    .select('id, title, status, project_id, specification_id, updated_at')
    .in('project_id', projectIds)
    .in('status', ['todo', 'in_progress'])
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (openTaskError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: openTaskError.message },
      { status: 500 }
    );
  }

  // --- Client-side aggregation ---

  // Per-project requirement counts
  const reqCounts = new Map<string, number>();
  for (const r of reqRows ?? []) {
    reqCounts.set(r.project_id, (reqCounts.get(r.project_id) ?? 0) + 1);
  }

  // Per-project specification counts
  const specCounts = new Map<string, number>();
  for (const s of specRows ?? []) {
    specCounts.set(s.project_id, (specCounts.get(s.project_id) ?? 0) + 1);
  }

  // Per-project task counts (total + completed)
  const taskCounts = new Map<string, number>();
  const doneCounts = new Map<string, number>();
  const tasksByStatus = { todo: 0, in_progress: 0, done: 0 };

  for (const t of taskRows ?? []) {
    taskCounts.set(t.project_id, (taskCounts.get(t.project_id) ?? 0) + 1);
    if (t.status === 'done') {
      doneCounts.set(t.project_id, (doneCounts.get(t.project_id) ?? 0) + 1);
    }
    if (t.status === 'todo') {
      tasksByStatus.todo++;
    } else if (t.status === 'in_progress') {
      tasksByStatus.in_progress++;
    } else if (t.status === 'done') {
      tasksByStatus.done++;
    }
  }

  // Build dashboard projects
  const dashboardProjects = (projects ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status as 'active' | 'paused' | 'completed' | 'archived',
    counts: {
      requirements: reqCounts.get(p.id) ?? 0,
      specifications: specCounts.get(p.id) ?? 0,
      tasks: taskCounts.get(p.id) ?? 0,
      completedTasks: doneCounts.get(p.id) ?? 0,
    },
  }));

  // Build open tasks with project names
  const openTasks = (openTaskRows ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as 'todo' | 'in_progress',
    projectId: t.project_id,
    specificationId: t.specification_id,
    projectName: projectNameMap.get(t.project_id) ?? 'Unknown Project',
    updatedAt: t.updated_at,
  }));

  const response = {
    summary: {
      totalProjects: projects?.length ?? 0,
      totalRequirements: reqRows?.length ?? 0,
      totalSpecifications: specRows?.length ?? 0,
      tasksByStatus,
    },
    projects: dashboardProjects,
    openTasks,
  };

  // Validate response shape
  const parsed = dashboardResponseSchema.safeParse(response);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Response validation failed',
        details: parsed.error.flatten(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json(parsed.data);
}
