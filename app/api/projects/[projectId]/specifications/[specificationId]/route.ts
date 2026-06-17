import { createClient, getUser } from '@/lib/supabase/server';
import {
  updateSpecificationSchema,
  validateSpecificationStatusTransition,
} from '@/lib/validators/specification';
import { buildSpecificationResponse } from '@/lib/helpers/specification-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; specificationId: string }>;
  }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, specificationId } = await params;
  const supabase = await createClient();

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const { data: spec, error } = await supabase
    .from('specifications')
    .select('*')
    .eq('id', specificationId)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .single();

  if (error || !spec) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Fetch linked requirements
  const { data: junctionRows } = await supabase
    .from('specification_requirements')
    .select(
      `
      requirement:requirement_id (
        id,
        title,
        type,
        priority,
        status
      )
    `
    )
    .eq('specification_id', specificationId);

  const linkedRequirements = (junctionRows ?? [])
    .map((row: Record<string, unknown>) => {
      const req = row.requirement as Record<string, unknown> | null;
      if (!req) return null;
      return {
        id: req.id as string,
        title: req.title as string,
        type: req.type as string,
        priority: req.priority as string,
        status: req.status as string,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    ...buildSpecificationResponse(spec),
    linked_requirements: linkedRequirements,
  });
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; specificationId: string }>;
  }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, specificationId } = await params;
  const supabase = await createClient();

  // Verify project ownership and status
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
        message: 'Cannot modify specifications in an archived project',
      },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = updateSpecificationSchema.safeParse(body);

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

  // Fetch current specification
  const { data: current, error: fetchError } = await supabase
    .from('specifications')
    .select('*')
    .eq('id', specificationId)
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
        message:
          'This specification was updated by someone else. Please refresh and try again.',
      },
      { status: 409 }
    );
  }

  // Validate status transition
  if (parsed.data.status && parsed.data.status !== current.status) {
    const transition = validateSpecificationStatusTransition(
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

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined)
    updateData.title = parsed.data.title.trim();
  if (parsed.data.description !== undefined)
    updateData.description = parsed.data.description;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  const { data: updated, error: updateError } = await supabase
    .from('specifications')
    .update(updateData)
    .eq('id', specificationId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: updateError.message },
      { status: 500 }
    );
  }

  // Handle requirement linking/unlinking if provided
  if (parsed.data.linked_requirement_ids !== undefined) {
    // Get current linked requirement IDs
    const { data: currentLinks } = await supabase
      .from('specification_requirements')
      .select('requirement_id')
      .eq('specification_id', specificationId);

    const currentIds = new Set(
      (currentLinks ?? []).map((r) => r.requirement_id)
    );
    const newIds = new Set(parsed.data.linked_requirement_ids);

    // IDs to add
    const toAdd = [...newIds].filter((id) => !currentIds.has(id));
    // IDs to remove
    const toRemove = [...currentIds].filter((id) => !newIds.has(id));

    // Remove unlinked requirements
    if (toRemove.length > 0) {
      await supabase
        .from('specification_requirements')
        .delete()
        .eq('specification_id', specificationId)
        .in('requirement_id', toRemove);
    }

    // Add new links
    if (toAdd.length > 0) {
      const junctionRows = toAdd.map((reqId) => ({
        specification_id: specificationId,
        requirement_id: reqId,
        owner_id: user.id,
      }));

      await supabase
        .from('specification_requirements')
        .insert(junctionRows);
    }
  }

  // Fetch linked requirements for response
  const { data: junctionRows } = await supabase
    .from('specification_requirements')
    .select(
      `
      requirement:requirement_id (
        id,
        title,
        type,
        priority,
        status
      )
    `
    )
    .eq('specification_id', specificationId);

  const linkedRequirements = (junctionRows ?? [])
    .map((row) => {
      const req = row.requirement as unknown as Record<string, unknown> | null;
      if (!req) return null;
      return {
        id: req.id as string,
        title: req.title as string,
        type: req.type as string,
        priority: req.priority as string,
        status: req.status as string,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    ...buildSpecificationResponse(updated),
    linked_requirements: linkedRequirements,
  });
}

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; specificationId: string }>;
  }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, specificationId } = await params;
  const supabase = await createClient();

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Verify specification exists and is not already deleted
  const { data: existing, error: fetchError } = await supabase
    .from('specifications')
    .select('id, deleted_at')
    .eq('id', specificationId)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Soft delete the specification
  const { error: deleteError } = await supabase
    .from('specifications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', specificationId);

  if (deleteError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: deleteError.message },
      { status: 500 }
    );
  }

  // Cascade unlink: delete all junction rows for this specification
  await supabase
    .from('specification_requirements')
    .delete()
    .eq('specification_id', specificationId);

  return NextResponse.json({ success: true });
}
