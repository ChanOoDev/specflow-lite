import { createClient, getUser, isGuest } from '@/lib/supabase/server';
import {
  updateRequirementSchema,
  validateRequirementStatusTransition,
} from '@/lib/validators/requirement';
import { buildRequirementResponse } from '@/lib/helpers/requirement-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; requirementId: string }> }
) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user && !guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, requirementId } = await params;
  const supabase = await createClient();

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', user!.id)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('id', requirementId)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json(buildRequirementResponse(data));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; requirementId: string }> }
) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user || guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, requirementId } = await params;
  const supabase = await createClient();

  // Verify project ownership and status
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, status')
    .eq('id', projectId)
    .eq('owner_id', user!.id)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  if (project.status === 'archived') {
    return NextResponse.json(
      { error: 'PROJECT_ARCHIVED', message: 'Cannot modify requirements in an archived project' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = updateRequirementSchema.safeParse(body);

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

  // Fetch current requirement
  const { data: current, error: fetchError } = await supabase
    .from('requirements')
    .select('*')
    .eq('id', requirementId)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Optimistic lock check
  if (current.updated_at !== parsed.data.updated_at) {
    return NextResponse.json(
      {
        error: 'CONFLICT',
        message: 'This requirement was updated by someone else. Please refresh and try again.',
      },
      { status: 409 }
    );
  }

  // Validate status transition
  if (parsed.data.status && parsed.data.status !== current.status) {
    const transition = validateRequirementStatusTransition(
      current.status,
      parsed.data.status
    );
    if (!transition.valid) {
      return NextResponse.json(
        { error: 'INVALID_TRANSITION', message: transition.message },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title.trim();
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
  if (parsed.data.priority !== undefined) updateData.priority = parsed.data.priority;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  const { data, error } = await supabase
    .from('requirements')
    .update(updateData)
    .eq('id', requirementId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(buildRequirementResponse(data));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; requirementId: string }> }
) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user || guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, requirementId } = await params;
  const supabase = await createClient();

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', user!.id)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Verify requirement exists and is not already deleted
  const { data: existing, error: fetchError } = await supabase
    .from('requirements')
    .select('id, deleted_at')
    .eq('id', requirementId)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Soft delete
  const { error } = await supabase
    .from('requirements')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', requirementId);

  if (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
