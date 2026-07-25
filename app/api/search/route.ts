import { createClient, getUser, isGuest } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  type: 'project' | 'requirement' | 'specification';
  title: string;
  description: string | null;
  project_id: string | null;
  project_name: string | null;
  url: string;
  updated_at: string;
  match_rank: number;
}

async function searchInTable(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  table: string,
  columns: string[],
  query: string,
  projectIdField: string,
  selectExtra: string,
  limit: number
): Promise<SearchResult[]> {
  const searchConditions = columns
    .map((col) => `${col}.ilike.%${query}%`)
    .join(',');

  const { data } = await supabase
    .from(table)
    .select(`id, title, description, ${projectIdField}, updated_at ${selectExtra}`)
    .is('deleted_at', null)
    .or(searchConditions)
    .limit(limit)
    .order('updated_at', { ascending: false });

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    type: table === 'projects' ? 'project' : table === 'requirements' ? 'requirement' : 'specification',
    title: row.title as string,
    description: row.description as string | null,
    project_id: table === 'projects' ? (row.id as string) : (row[projectIdField] as string),
    project_name: null,
    url: '',
    updated_at: row.updated_at as string,
    match_rank: 0,
  }));
}

export async function GET(request: NextRequest) {
  const user = await getUser();
  const guest = await isGuest();
  if (!user && !guest) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.trim();
  const supabase = await createClient();

  // Search projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, description, updated_at')
    .is('deleted_at', null)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(5);

  const results: SearchResult[] = [];

  for (const p of projects ?? []) {
    results.push({
      id: p.id,
      type: 'project',
      title: p.title,
      description: p.description,
      project_id: p.id,
      project_name: p.title,
      url: `/projects/${p.id}`,
      updated_at: p.updated_at,
      match_rank: 100,
    });
  }

  // Search requirements
  const { data: requirements } = await supabase
    .from('requirements')
    .select('id, title, description, project_id, updated_at')
    .is('deleted_at', null)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(5);

  for (const r of requirements ?? []) {
    // Fetch project name
    const { data: p } = await supabase
      .from('projects')
      .select('title')
      .eq('id', r.project_id)
      .single();

    results.push({
      id: r.id,
      type: 'requirement',
      title: r.title,
      description: r.description,
      project_id: r.project_id,
      project_name: p?.title ?? 'Unknown',
      url: `/projects/${r.project_id}/requirements/${r.id}`,
      updated_at: r.updated_at,
      match_rank: 50,
    });
  }

  // Search specifications
  const { data: specifications } = await supabase
    .from('specifications')
    .select('id, title, description, project_id, updated_at')
    .is('deleted_at', null)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(5);

  for (const s of specifications ?? []) {
    const { data: p } = await supabase
      .from('projects')
      .select('title')
      .eq('id', s.project_id)
      .single();

    results.push({
      id: s.id,
      type: 'specification',
      title: s.title,
      description: s.description,
      project_id: s.project_id,
      project_name: p?.title ?? 'Unknown',
      url: `/projects/${s.project_id}/specifications/${s.id}`,
      updated_at: s.updated_at,
      match_rank: 30,
    });
  }

  // Sort by match_rank desc, then updated_at desc
  results.sort((a, b) => {
    const rankDiff = b.match_rank - a.match_rank;
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return NextResponse.json({ results });
}
