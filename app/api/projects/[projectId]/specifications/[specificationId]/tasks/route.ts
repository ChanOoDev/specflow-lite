import { createClient, getUser, isGuest } from '@/lib/supabase/server';
import {
  createTaskSchema,
  taskListQuerySchema,
} from '@/lib/validators/task';
import { buildTaskResponse } from '@/lib/helpers/task-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specificationId: string }> }
) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user && !guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, specificationId } = await params;
  const supabase = await createClient();

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Verify specification exists and belongs to this project
  const { data: specification, error: specError } = await supabase
    .from('specifications')
    .select('id')
    .eq('id', specificationId)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .single();

  if (specError || !specification) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = taskListQuerySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { search, status, page, pageSize } = parsed.data;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('specification_id', specificationId)
    .is('deleted_at', null);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const {
    data,
    error,
    count,
  } = await query
    .order('position', { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }

  const total = count ?? 0;
  const tasks = (data ?? []).map(buildTaskResponse);

  return NextResponse.json({
    data: tasks,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specificationId: string }> }
) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user || guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, specificationId } = await params;
  const supabase = await createClient();

  // Verify project ownership and status
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  if (project.status === 'archived') {
    return NextResponse.json(
      {
        error: 'PROJECT_ARCHIVED',
        message: 'Cannot create tasks in an archived project',
      },
      { status: 400 }
    );
  }

  // Verify specification exists, belongs to project, and is not approved
  const { data: specification, error: specError } = await supabase
    .from('specifications')
    .select('id, status')
    .eq('id', specificationId)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .single();

  if (specError || !specification) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  if (specification.status === 'approved') {
    return NextResponse.json(
      {
        error: 'SPEC_APPROVED',
        message: 'Cannot create tasks in an approved specification',
      },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // Determine next position: MAX(position) + 1
  const { data: positionResult } = await supabase
    .from('tasks')
    .select('position')
    .eq('specification_id', specificationId)
    .is('deleted_at', null)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = (positionResult?.position ?? 0) + 1;

  // Create the task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      specification_id: specificationId,
      title: parsed.data.title.trim(),
      description: parsed.data.description ?? '',
      position: nextPosition,
      owner_id: user!.id, // Will be overridden by trigger, satisfies RLS check
    })
    .select()
    .single();

  if (taskError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: taskError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(buildTaskResponse(task), { status: 201 });
}
