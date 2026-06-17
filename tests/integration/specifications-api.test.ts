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

describe('Specifications API', () => {
  // ── Unauthenticated tests ──────────────────────────────────────────

  describe('POST /api/projects/:projectId/specifications', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await fetch(
        `${BASE_URL}/projects/00000000-0000-0000-0000-000000000000/specifications`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Test Spec' }),
        }
      );
      expect([401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/projects/:projectId/specifications', () => {
    it('rejects unauthenticated requests', async () => {
      const res = await fetch(
        `${BASE_URL}/projects/00000000-0000-0000-0000-000000000000/specifications`
      );
      expect([401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/projects/:projectId/specifications/:id', () => {
    it('returns 404 for non-existent specification', async () => {
      const res = await fetch(
        `${BASE_URL}/projects/00000000-0000-0000-0000-000000000000/specifications/00000000-0000-0000-0000-000000000000`
      );
      expect([401, 404]).toContain(res.status);
    });
  });

  // ── Authenticated tests ────────────────────────────────────────────

  describe('with authentication', () => {
    let userA: TestUser;
    let userB: TestUser;
    let testProjectId: string | null = null;
    const createdSpecificationIds: string[] = [];

    beforeAll(async () => {
      const ts = Date.now();

      const { data: signUpA } = await supabase.auth.signUp({
        email: `spec-test-a-${ts}@example.com`,
        password: 'TestPass123!',
      });

      const { data: signUpB } = await supabase.auth.signUp({
        email: `spec-test-b-${ts}@example.com`,
        password: 'TestPass123!',
      });

      if (!signUpA?.user || !signUpB?.user) {
        console.warn(
          'Skipping authenticated tests: unable to sign up test users.'
        );
        return;
      }

      const { data: sessionA } = await supabase.auth.signInWithPassword({
        email: `spec-test-a-${ts}@example.com`,
        password: 'TestPass123!',
      });

      const { data: sessionB } = await supabase.auth.signInWithPassword({
        email: `spec-test-b-${ts}@example.com`,
        password: 'TestPass123!',
      });

      userA = {
        email: `spec-test-a-${ts}@example.com`,
        password: 'TestPass123!',
        session: sessionA?.session ?? null,
      };

      userB = {
        email: `spec-test-b-${ts}@example.com`,
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
            name: `Spec API Test Project ${ts}`,
          }),
        });

        if (createRes.ok) {
          const project = await createRes.json();
          testProjectId = project.id;
        }
      }
    });

    // ── Create Specification Tests ────────────────────────────────────

    it('creates a specification with valid data', async () => {
      if (!userA?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const res = await fetch(
        `${BASE_URL}/projects/${testProjectId}/specifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({
            title: 'Auth System Specification',
            description: 'Design for authentication and authorization',
          }),
        }
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.title).toBe('Auth System Specification');
      expect(body.status).toBe('draft');
      expect(body.project_id).toBe(testProjectId);
      createdSpecificationIds.push(body.id);
    });

    it('rejects specification with empty title', async () => {
      if (!userA?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const res = await fetch(
        `${BASE_URL}/projects/${testProjectId}/specifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({ title: '' }),
        }
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('VALIDATION_ERROR');
    });

    it('rejects specification with title exceeding 200 chars', async () => {
      if (!userA?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const res = await fetch(
        `${BASE_URL}/projects/${testProjectId}/specifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userA),
          },
          body: JSON.stringify({ title: 'a'.repeat(201) }),
        }
      );

      expect(res.status).toBe(400);
    });

    // ── Non-Owner Access Tests ───────────────────────────────────────

    it('returns 404 when non-owner tries to create specification', async () => {
      if (!userA?.session || !userB?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const createRes = await fetch(
        `${BASE_URL}/projects/${testProjectId}/specifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(userB),
          },
          body: JSON.stringify({
            title: 'Hijacked Specification',
          }),
        }
      );

      expect(createRes.status).toBe(404);
    });

    it('returns 404 when non-owner tries to list specifications', async () => {
      if (!userA?.session || !userB?.session || !testProjectId) {
        console.warn('Skipping: no auth session or test project');
        return;
      }

      const listRes = await fetch(
        `${BASE_URL}/projects/${testProjectId}/specifications`,
        { headers: authHeader(userB) }
      );

      expect(listRes.status).toBe(404);
    });

    // ── Optimistic Locking Test ──────────────────────────────────────

    it('rejects update with stale updated_at', async () => {
      if (!userA?.session || createdSpecificationIds.length === 0 || !testProjectId) {
        console.warn('Skipping: no auth session or test specifications');
        return;
      }

      const specId = createdSpecificationIds[0]!;
      const staleTimestamp = '2020-01-01T00:00:00.000Z';

      const updateRes = await fetch(
        `${BASE_URL}/projects/${testProjectId}/specifications/${specId}`,
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

    // ── Cleanup ──────────────────────────────────────────────────────

    afterAll(async () => {
      for (const id of createdSpecificationIds) {
        await fetch(
          `${BASE_URL}/projects/${testProjectId}/specifications/${id}`,
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
