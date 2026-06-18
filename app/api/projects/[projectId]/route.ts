import { createClient, getUser, isGuest } from '@/lib/supabase/server';
import { updateProjectSchema, validateStatusTransition } from '@/lib/validators/project';
import { buildProjectResponse } from '@/lib/helpers/project-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user && !guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('owner_id', user!.id)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const { count: reqCount } = await supabase
    .from('requirements')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .is('deleted_at', null);

  const { count: specCount } = await supabase
    .from('specifications')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .is('deleted_at', null);

  const { count: taskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .is('deleted_at', null);

  const { count: doneTaskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('status', 'done')
    .is('deleted_at', null);

  return NextResponse.json(
    buildProjectResponse(data, {
      requirements: reqCount ?? 0,
      specifications: specCount ?? 0,
      tasks: taskCount ?? 0,
      completedTasks: doneTaskCount ?? 0,
    })
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user || guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId } = await params;
  const body = await request.json();

  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Fetch current project
  const { data: current, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('owner_id', user!.id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Optimistic lock check
  if (current.updated_at !== parsed.data.updated_at) {
    return NextResponse.json(
      { error: 'CONFLICT', message: 'This project was updated by someone else. Please refresh and try again.' },
      { status: 409 }
    );
  }

  // Validate status transition
  if (parsed.data.status && parsed.data.status !== current.status) {
    const transition = validateStatusTransition(current.status, parsed.data.status);
    if (!transition.valid) {
      return NextResponse.json(
        { error: 'INVALID_TRANSITION', message: transition.message },
        { status: 400 }
      );
    }
  }

  // Check name uniqueness if name changed
  if (parsed.data.name && parsed.data.name.toLowerCase() !== current.name.toLowerCase()) {
    const { data: dup } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user!.id)
      .ilike('name', parsed.data.name.trim())
      .is('deleted_at', null)
      .neq('id', projectId)
      .maybeSingle();

    if (dup) {
      return NextResponse.json(
        { error: 'NAME_DUPLICATE', message: 'A project with this name already exists' },
        { status: 409 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name.trim();
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json(buildProjectResponse(data));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user || guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId } = await params;
  const supabase = await createClient();

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('projects')
    .select('id, deleted_at')
    .eq('id', projectId)
    .eq('owner_id', user!.id)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Soft delete
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString(), status: 'archived' })
    .eq('id', projectId);

  if (error) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
