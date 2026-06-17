import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'http://localhost:3000/api';

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

describe('Requirements API', () => {
  // ── Unauthenticated tests ────────────────────────────────────────

  describe('POST /api/projects/:projectId/requirements', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await fetch(
        `${BASE_URL}/projects/00000000-0000-0000-0000-000000000000/requirements`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Test',
            type: 'functional',
            priority: 'p1',
          }),
        }
      );
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/projects/:projectId/requirements', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await fetch(
        `${BASE_URL}/projects/00000000-0000-0000-0000-000000000000/requirements`
      );
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/projects/:projectId/requirements/:id', () => {
    it('returns 404 for non-existent requirement', async () => {
      const res = await fetch(
        `${BASE_URL}/projects/00000000-0000-0000-0000-000000000000/requirements/00000000-0000-0000-0000-000000000000`
      );
      expect([401, 404]).toContain(res.status);
    });
  });

  // ── Authenticated tests ──────────────────────────────────────────

  describe('with authentication', () => {
    let userA: TestUser;
    let userB: TestUser;
    let testProjectId: string | null = null;
    const createdRequirementIds: string[] = [];

    beforeAll(async () => {
      const ts = Date.now();

      const { data: signUpA } = await supabase.auth.signUp({
        email: `test-a-${ts}@example.com`,
        password: 'TestPass123!',
      });

      const { data: signUpB } = await supabase.auth.signUp({
        email: `test-b-${ts}@example.com`,
        password: 'TestPass123!',
      });

      if (!signUpA?.user || !signUpB?.user) {
        console.warn(
          'Skipping authenticated tests: unable to sign up test users.'
        );
        return;
      }

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

      // Create a test project for user A
      if (userA.session) {
        const createRes = await fetch(`${BASE_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({
            name: `API Test Project ${ts}`,
          }),
        });

        if (createRes.ok) {
          const project = await createRes.json();
          testProjectId = project.id;
        }
      }
    });

    // ── Create Requirement Tests ───────────────────────────────────

    it('creates a requirement with valid data', async () => {
      if (!userA?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const res = await fetch(
        `${BASE_URL}/projects/${testProjectId}/requirements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({
            title: 'User Login Page',
            description: 'Implement login with email/password',
            type: 'functional',
            priority: 'p1',
          }),
        }
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.title).toBe('User Login Page');
      expect(body.type).toBe('functional');
      expect(body.priority).toBe('p1');
      expect(body.status).toBe('draft');
      expect(body.project_id).toBe(testProjectId);
      createdRequirementIds.push(body.id);
    });

    it('rejects requirement with empty title', async () => {
      if (!userA?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const res = await fetch(
        `${BASE_URL}/projects/${testProjectId}/requirements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({
            title: '',
            type: 'functional',
            priority: 'p1',
          }),
        }
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('VALIDATION_ERROR');
    });

    it('rejects requirement with invalid type', async () => {
      if (!userA?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const res = await fetch(
        `${BASE_URL}/projects/${testProjectId}/requirements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({
            title: 'Test',
            type: 'bogus',
            priority: 'p1',
          }),
        }
      );

      expect(res.status).toBe(400);
    });

    it('rejects requirement with invalid priority', async () => {
      if (!userA?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const res = await fetch(
        `${BASE_URL}/projects/${testProjectId}/requirements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({
            title: 'Test',
            type: 'functional',
            priority: 'p99',
          }),
        }
      );

      expect(res.status).toBe(400);
    });

    // ── Non-Owner Access Tests ─────────────────────────────────────

    it('returns 404 when non-owner tries to access requirements', async () => {
      if (!userA?.session || !userB?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      // User B tries to create a requirement in User A's project
      const createRes = await fetch(
        `${BASE_URL}/projects/${testProjectId}/requirements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userB),
          },
          body: JSON.stringify({
            title: 'Hijacked Requirement',
            type: 'functional',
            priority: 'p1',
          }),
        }
      );

      expect(createRes.status).toBe(404);
    });

    it('returns 404 when non-owner tries to list requirements', async () => {
      if (!userA?.session || !userB?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const listRes = await fetch(
        `${BASE_URL}/projects/${testProjectId}/requirements`,
        { headers: authHeader(userB) }
      );

      expect(listRes.status).toBe(404);
    });

    // ── Optimistic Locking Test ────────────────────────────────────

    it('rejects update with stale updated_at', async () => {
      if (!userA?.session || createdRequirementIds.length === 0 || !testProjectId) {
        console.warn('Skipping: no auth session or test requirements');
        return;
      }

      const requirementId = createdRequirementIds[0]!;
      const staleTimestamp = '2020-01-01T00:00:00.000Z';

      const updateRes = await fetch(
        `${BASE_URL}/projects/${testProjectId}/requirements/${requirementId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({
            title: 'Stale Update Attempt',
            updated_at: staleTimestamp,
          }),
        }
      );

      expect(updateRes.status).toBe(409);
      const body = await updateRes.json();
      expect(body.error).toBe('CONFLICT');
    });

    // ── Cleanup ────────────────────────────────────────────────────

    afterAll(async () => {
      for (const id of createdRequirementIds) {
        await fetch(
          `${BASE_URL}/projects/${testProjectId}/requirements/${id}`,
          {
            method: 'DELETE',
            headers: authHeader(userA),
          }
        ).catch(() => {});
      }

      if (testProjectId && userA?.session) {
        await fetch(`${BASE_URL}/projects/${testProjectId}`, {
          method: 'DELETE',
          headers: authHeader(userA),
        }).catch(() => {});
      }
    });
  });
});
