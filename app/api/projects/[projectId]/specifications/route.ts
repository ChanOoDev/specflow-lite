import { createClient, getUser } from '@/lib/supabase/server';
import {
  createSpecificationSchema,
  specificationListQuerySchema,
} from '@/lib/validators/specification';
import { buildSpecificationResponse } from '@/lib/helpers/specification-response';
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
  const parsed = specificationListQuerySchema.safeParse(searchParams);

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
    .from('specifications')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId)
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
    .order('updated_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }

  const total = count ?? 0;
  const specifications = (data ?? []).map(buildSpecificationResponse);

  return NextResponse.json({
    data: specifications,
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
      {
        error: 'PROJECT_ARCHIVED',
        message: 'Cannot create specifications in an archived project',
      },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = createSpecificationSchema.safeParse(body);

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

  // Create the specification
  const { data: spec, error: specError } = await supabase
    .from('specifications')
    .insert({
      project_id: projectId,
      title: parsed.data.title.trim(),
      description: parsed.data.description ?? '',
      owner_id: user.id, // Will be overridden by trigger, satisfies RLS check
    })
    .select()
    .single();

  if (specError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: specError.message },
      { status: 500 }
    );
  }

  // Insert junction rows for linked requirements
  const linkedIds = parsed.data.linked_requirement_ids ?? [];
  if (linkedIds.length > 0) {
    const junctionRows = linkedIds.map((reqId) => ({
      specification_id: spec.id,
      requirement_id: reqId,
      owner_id: user.id,
    }));

    const { error: junctionError } = await supabase
      .from('specification_requirements')
      .insert(junctionRows);

    if (junctionError) {
      // If linking fails, still return the spec (link failure is non-fatal
      // for the spec creation itself — the user can re-link later)
    }
  }

  return NextResponse.json(buildSpecificationResponse(spec), { status: 201 });
}
