import { createClient, getUser } from '@/lib/supabase/server';
import { createProjectSchema, projectListQuerySchema } from '@/lib/validators/project';
import { buildProjectResponse } from '@/lib/helpers/project-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = projectListQuerySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { search, status, page, pageSize, includeArchived } = parsed.data;
  const supabase = await createClient();
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('owner_id', user.id)
    .is('deleted_at', null);

  // By default, exclude archived. Show them only if includeArchived is true
  if (!includeArchived) {
    query = query.neq('status', 'archived');
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
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
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  const projects = (data ?? []).map((row) => buildProjectResponse(row));

  return NextResponse.json({
    data: projects,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Check name uniqueness
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', user.id)
    .ilike('name', parsed.data.name)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'NAME_DUPLICATE', message: 'A project with this name already exists' },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: parsed.data.name.trim(),
      description: parsed.data.description ?? '',
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json(buildProjectResponse(data), { status: 201 });
}
