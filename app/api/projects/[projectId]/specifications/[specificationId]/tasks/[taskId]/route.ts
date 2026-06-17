import { createClient, getUser } from '@/lib/supabase/server';
import {
  updateTaskSchema,
  validateTaskStatusTransition,
} from '@/lib/validators/task';
import { buildTaskResponse } from '@/lib/helpers/task-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specificationId: string; taskId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, specificationId, taskId } = await params;
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

  // Verify specification exists and belongs to this project
  const { data: specification, error: specError } = await supabase
    .from('specifications')
    .select('id, title')
    .eq('id', specificationId)
    .eq('project_id', projectId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (specError || !specification) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Fetch task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('specification_id', specificationId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({
    ...buildTaskResponse(task),
    specification_title: specification.title,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specificationId: string; taskId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, specificationId, taskId } = await params;
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

  // Verify specification exists and is not approved
  const { data: specification, error: specError } = await supabase
    .from('specifications')
    .select('id, status, title')
    .eq('id', specificationId)
    .eq('project_id', projectId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (specError || !specification) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Fetch current task
  const { data: currentTask, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('specification_id', specificationId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (taskError || !currentTask) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateTaskSchema.safeParse(body);

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

  // Optimistic locking check
  if (parsed.data.updated_at !== currentTask.updated_at) {
    return NextResponse.json(
      {
        error: 'CONFLICT',
        message:
          'This task was updated by someone else. Please refresh and try again.',
      },
      { status: 409 }
    );
  }

  // Prevent edits on approved specs (defense in depth — trigger also enforces)
  if (specification.status === 'approved') {
    return NextResponse.json(
      {
        error: 'SPEC_APPROVED',
        message: 'Cannot modify tasks in an approved specification',
      },
      { status: 400 }
    );
  }

  // Prevent edits on archived projects
  if (project.status === 'archived') {
    return NextResponse.json(
      {
        error: 'PROJECT_ARCHIVED',
        message: 'Cannot modify tasks in an archived project',
      },
      { status: 400 }
    );
  }

  // Validate status transition
  if (parsed.data.status !== undefined) {
    const statusCheck = validateTaskStatusTransition(
      currentTask.status,
      parsed.data.status
    );
    if (!statusCheck.valid) {
      return NextResponse.json(
        { error: 'INVALID_TRANSITION', message: statusCheck.message },
        { status: 400 }
      );
    }
  }

  // Handle position reorder if needed
  if (
    parsed.data.position !== undefined &&
    parsed.data.position !== currentTask.position
  ) {
    const targetPos = parsed.data.position;
    const oldPos = currentTask.position;

    // Get all non-deleted tasks in the spec, ordered by position
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('id, position')
      .eq('specification_id', specificationId)
      .is('deleted_at', null)
      .neq('id', taskId)
      .order('position', { ascending: true });

    const otherTasks = (allTasks ?? []).filter(
      (t) => t.id !== taskId
    );

    // Build new position list: insert task at targetPos
    const allPositions = otherTasks.map((t) => t.position as number);
    // Clamp targetPos to valid range
    const clampedTarget = Math.max(
      1,
      Math.min(targetPos, allPositions.length + 1)
    );

    // Shift others to make room
    for (const t of otherTasks) {
      const currentPos = t.position as number;
      let newPos = currentPos;
      if (oldPos < clampedTarget && currentPos > oldPos && currentPos <= clampedTarget) {
        newPos = currentPos - 1; // shift down
      } else if (oldPos > clampedTarget && currentPos >= clampedTarget && currentPos < oldPos) {
        newPos = currentPos + 1; // shift up
      }
      if (newPos !== currentPos) {
        await supabase
          .from('tasks')
          .update({ position: newPos })
          .eq('id', t.id);
      }
    }

    // Use clamped target position instead
    parsed.data.position = clampedTarget;
  }

  // Build update payload
  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title.trim();
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.position !== undefined) updateData.position = parsed.data.position;

  const { data: updatedTask, error: updateError } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ...buildTaskResponse(updatedTask),
    specification_title: specification.title,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specificationId: string; taskId: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { projectId, specificationId, taskId } = await params;
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

  // Verify specification exists
  const { data: specification, error: specError } = await supabase
    .from('specifications')
    .select('id, status')
    .eq('id', specificationId)
    .eq('project_id', projectId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (specError || !specification) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Fetch current task
  const { data: currentTask, error: taskError } = await supabase
    .from('tasks')
    .select('id, position')
    .eq('id', taskId)
    .eq('specification_id', specificationId)
    .eq('owner_id', user.id)
    .is('deleted_at', null)
    .single();

  if (taskError || !currentTask) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Prevent deletes on approved specs
  if (specification.status === 'approved') {
    return NextResponse.json(
      {
        error: 'SPEC_APPROVED',
        message: 'Cannot delete tasks in an approved specification',
      },
      { status: 400 }
    );
  }

  // Prevent deletes on archived projects
  if (project.status === 'archived') {
    return NextResponse.json(
      {
        error: 'PROJECT_ARCHIVED',
        message: 'Cannot delete tasks in an archived project',
      },
      { status: 400 }
    );
  }

  // Soft-delete the task
  const { error: deleteError } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', taskId);

  if (deleteError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: deleteError.message },
      { status: 500 }
    );
  }

  // Compact remaining task positions (fill the gap)
  const { data: remainingTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('specification_id', specificationId)
    .is('deleted_at', null)
    .order('position', { ascending: true });

  if (remainingTasks) {
    for (let i = 0; i < remainingTasks.length; i++) {
      const task = remainingTasks[i] as { id: string };
      await supabase
        .from('tasks')
        .update({ position: i + 1 })
        .eq('id', task.id);
    }
  }

  return NextResponse.json({ success: true });
}
