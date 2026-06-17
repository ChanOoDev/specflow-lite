import { createClient, getUser } from '@/lib/supabase/server';
import {
  createRequirementSchema,
  requirementListQuerySchema,
} from '@/lib/validators/requirement';
import { buildRequirementResponse } from '@/lib/helpers/requirement-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId } = await params;
  const supabase = await createClient();

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = requirementListQuerySchema.safeParse(searchParams);

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

  const { search, type, priority, status, page, pageSize } = parsed.data;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('requirements')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
    .is('deleted_at', null);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (priority) {
    query = query.eq('priority', priority);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const {
    data,
    error,
    count,
  } = await query
    .order('updated_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }

  const total = count ?? 0;
  const requirements = (data ?? []).map(buildRequirementResponse);

  return NextResponse.json({
    data: requirements,
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
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId } = await params;
  const supabase = await createClient();

  // Verify project ownership and not archived
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  if (project.status === 'archived') {
    return NextResponse.json(
      { error: 'PROJECT_ARCHIVED', message: 'Cannot create requirements in an archived project' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = createRequirementSchema.safeParse(body);

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

  const { data, error } = await supabase
    .from('requirements')
    .insert({
      project_id: projectId,
      title: parsed.data.title.trim(),
      description: parsed.data.description ?? '',
      type: parsed.data.type,
      priority: parsed.data.priority,
      owner_id: user.id, // Will be overridden by trigger, but satisfies RLS check
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(buildRequirementResponse(data), { status: 201 });
}
