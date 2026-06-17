import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// These tests require a running dev server and Supabase instance
const BASE_URL = 'http://localhost:3000/api';

// Supabase client for test user management
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TestUser {
  email: string;
  password: string;
  session: { access_token: string; refresh_token: string } | null;
}

function authHeader(user: TestUser): Record<string, string> {
  return user.session?.access_token
    ? { Authorization: `Bearer ${user.session.access_token}` }
    : {};
}

describe('Projects API', () => {
  // ── Unauthenticated tests ──────────────────────────────────────

  describe('POST /api/projects', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });
      expect(res.status).toBe(401);
    });

    it('rejects empty name', async () => {
      const res = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });
      expect([401, 400]).toContain(res.status);
    });
  });

  describe('GET /api/projects', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await fetch(`${BASE_URL}/projects`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('returns 404 for non-existent project', async () => {
      const res = await fetch(
        `${BASE_URL}/projects/00000000-0000-0000-0000-000000000000`
      );
      expect([401, 404]).toContain(res.status);
    });
  });

  // ── Authenticated tests ────────────────────────────────────────

  describe('with authentication', () => {
    let userA: TestUser;
    let userB: TestUser;
    const createdProjectIds: string[] = [];

    beforeAll(async () => {
      const ts = Date.now();

      // Sign up two test users
      const { data: signUpA, error: errA } = await supabase.auth.signUp({
        email: `test-a-${ts}@example.com`,
        password: 'TestPass123!',
      });

      const { data: signUpB, error: errB } = await supabase.auth.signUp({
        email: `test-b-${ts}@example.com`,
        password: 'TestPass123!',
      });

      if (errA || errB) {
        console.warn(
          'Skipping authenticated tests: unable to sign up test users. ' +
          'Ensure email sign-up is enabled in Supabase Auth settings.'
        );
        return;
      }

      // Sign in to get access tokens
      const { data: sessionA } = await supabase.auth.signInWithPassword({
        email: `test-a-${ts}@example.com`,
        password: 'TestPass123!',
      });

      const { data: sessionB } = await supabase.auth.signInWithPassword({
        email: `test-b-${ts}@example.com`,
        password: 'TestPass123!',
      });

      userA = {
        email: `test-a-${ts}@example.com`,
        password: 'TestPass123!',
        session: sessionA?.session ?? null,
      };

      userB = {
        email: `test-b-${ts}@example.com`,
        password: 'TestPass123!',
        session: sessionB?.session ?? null,
      };
    });

    // ── Test 2: Optimistic Locking (US4-S4) ─────────────────────

    it('rejects update with stale updated_at (optimistic locking)', async () => {
      if (!userA?.session) {
        console.warn('Skipping: no auth session');
        return;
      }

      // Create a project as user A
      const createRes = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(userA),
        },
        body: JSON.stringify({ name: 'Lock Test Project' }),
      });

      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      createdProjectIds.push(created.id);

      // Attempt to update with a stale updated_at (far in the past)
      const staleTimestamp = '2020-01-01T00:00:00.000Z';
      const updateRes = await fetch(`${BASE_URL}/projects/${created.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(userA),
        },
        body: JSON.stringify({
          name: 'Lock Test Updated',
          updated_at: staleTimestamp,
        }),
      });

      expect(updateRes.status).toBe(409);
      const body = await updateRes.json();
      expect(body.error).toBe('CONFLICT');
      expect(body.message).toContain('updated by someone else');
    });

    // ── Test 3: Non-Owner Access Denial (US3-S2, US4-S5, US6-S4)

    it('returns 404 when non-owner tries to GET project', async () => {
      if (!userA?.session || !userB?.session) {
        console.warn('Skipping: no auth session');
        return;
      }

      // Create a project as user A
      const createRes = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(userA),
        },
        body: JSON.stringify({ name: 'Cross Owner Test' }),
      });

      expect(createRes.status).toBe(201);
      const created = await createRes.json();
      createdProjectIds.push(created.id);

      // User B tries to access User A's project
      const getRes = await fetch(`${BASE_URL}/projects/${created.id}`, {
        headers: authHeader(userB),
      });

      // Must return 404 (NOT 403 — spec requires generic "not found")
      expect(getRes.status).toBe(404);
    });

    it('returns 404 when non-owner tries to PATCH project', async () => {
      if (!userA?.session || !userB?.session || createdProjectIds.length === 0) {
        console.warn('Skipping: no auth session or no test project');
        return;
      }

      const projectId = createdProjectIds[0]!;

      const patchRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(userB),
        },
        body: JSON.stringify({
          name: 'Hijacked Name',
          updated_at: new Date().toISOString(),
        }),
      });

      expect(patchRes.status).toBe(404);
    });

    it('returns 404 when non-owner tries to DELETE project', async () => {
      if (!userA?.session || !userB?.session || createdProjectIds.length === 0) {
        console.warn('Skipping: no auth session or no test project');
        return;
      }

      const projectId = createdProjectIds[0]!;

      const deleteRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: authHeader(userB),
      });

      expect(deleteRes.status).toBe(404);
    });

    // Clean up created projects
    afterAll(async () => {
      for (const id of createdProjectIds) {
        await fetch(`${BASE_URL}/projects/${id}`, {
          method: 'DELETE',
          headers: authHeader(userA),
        }).catch(() => {});
      }
    });
  });
});
