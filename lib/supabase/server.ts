import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY are required. ' +
      'Check your Vercel project settings → Environment Variables.'
    );
  }

  // Guest mode — uses same anon key. Public read policies in migration 005
  // allow unauthenticated reads. POST/PATCH/DELETE handlers block guests.
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored if called from a Server Component
        }
      },
    },
  });
}

/**
 * Check if the current request is from a guest user.
 */
export async function isGuest(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('guest-mode')?.value === 'true';
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  // Guest users have no Supabase user
  if (await isGuest()) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
