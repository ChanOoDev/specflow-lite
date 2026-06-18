import { createClient, getUser, isGuest } from '@/lib/supabase/server';
import { buildProjectResponse } from '@/lib/helpers/project-response';
import { NextRequest, NextResponse } from 'next/server';

type ArchiveAction = 'archive' | 'restore';

const VALID_ACTIONS = ['archive', 'restore'] as const;

export async function POST(
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
  const action = body?.action as ArchiveAction;

  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Action must be "archive" or "restore"' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

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

  if (action === 'archive') {
    if (current.status === 'archived') {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Project is already archived' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'archived' })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
    }

    return NextResponse.json(buildProjectResponse(data));
  }

  // Restore
  if (current.status !== 'archived') {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Only archived projects can be restored' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ status: 'active' })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }

  return NextResponse.json(buildProjectResponse(data));
}

