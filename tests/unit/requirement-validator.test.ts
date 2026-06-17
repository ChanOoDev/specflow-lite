import { describe, it, expect } from 'vitest';
import {
  createRequirementSchema,
  updateRequirementSchema,
  requirementListQuerySchema,
} from '@/lib/validators/requirement';

describe('createRequirementSchema', () => {
  it('validates a valid requirement', () => {
    const result = createRequirementSchema.safeParse({
      title: 'User Login Page',
      type: 'functional',
      priority: 'p1',
    });
    expect(result.success).toBe(true);
  });

  it('validates with optional description', () => {
    const result = createRequirementSchema.safeParse({
      title: 'Dark Mode',
      description: 'Support system dark/light theme toggle',
      type: 'ux',
      priority: 'p3',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createRequirementSchema.safeParse({
      title: '',
      type: 'functional',
      priority: 'p1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const result = createRequirementSchema.safeParse({
      type: 'functional',
      priority: 'p1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 200 chars', () => {
    const result = createRequirementSchema.safeParse({
      title: 'a'.repeat(201),
      type: 'functional',
      priority: 'p1',
    });
    expect(result.success).toBe(false);
  });

  it('accepts title with exactly 200 chars', () => {
    const result = createRequirementSchema.safeParse({
      title: 'a'.repeat(200),
      type: 'functional',
      priority: 'p1',
    });
    expect(result.success).toBe(true);
  });

  it('defaults description to empty string', () => {
    const result = createRequirementSchema.safeParse({
      title: 'Test',
      type: 'functional',
      priority: 'p1',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
    }
  });

  it('rejects description exceeding 3000 chars', () => {
    const result = createRequirementSchema.safeParse({
      title: 'Test',
      description: 'a'.repeat(3001),
      type: 'functional',
      priority: 'p1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = createRequirementSchema.safeParse({
      title: 'Test',
      type: 'invalid',
      priority: 'p1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const result = createRequirementSchema.safeParse({
      title: 'Test',
      type: 'functional',
      priority: 'p99',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid types', () => {
    for (const type of ['functional', 'non_functional', 'technical', 'ux']) {
      const result = createRequirementSchema.safeParse({
        title: 'Test',
        type,
        priority: 'p1',
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid priorities', () => {
    for (const priority of ['p1', 'p2', 'p3', 'p4', 'p5']) {
      const result = createRequirementSchema.safeParse({
        title: 'Test',
        type: 'functional',
        priority,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateRequirementSchema', () => {
  it('validates update with title', () => {
    const result = updateRequirementSchema.safeParse({
      title: 'Updated Title',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with description', () => {
    const result = updateRequirementSchema.safeParse({
      description: 'Updated description',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with type', () => {
    const result = updateRequirementSchema.safeParse({
      type: 'technical',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with priority', () => {
    const result = updateRequirementSchema.safeParse({
      priority: 'p2',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with status', () => {
    const result = updateRequirementSchema.safeParse({
      status: 'approved',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty update body', () => {
    const result = updateRequirementSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing updated_at', () => {
    const result = updateRequirementSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = updateRequirementSchema.safeParse({
      status: 'invalid',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = updateRequirementSchema.safeParse({
      type: 'invalid',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('requirementListQuerySchema', () => {
  it('returns defaults for empty query', () => {
    const result = requirementListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('rejects page size over 50', () => {
    const result = requirementListQuerySchema.safeParse({ pageSize: '51' });
    expect(result.success).toBe(false);
  });

  it('rejects page less than 1', () => {
    const result = requirementListQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('accepts optional search filter', () => {
    const result = requirementListQuerySchema.safeParse({ search: 'login' });
    expect(result.success).toBe(true);
  });

  it('accepts type filter', () => {
    const result = requirementListQuerySchema.safeParse({ type: 'ux' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const result = requirementListQuerySchema.safeParse({ type: 'bogus' });
    expect(result.success).toBe(false);
  });

  it('accepts priority filter', () => {
    const result = requirementListQuerySchema.safeParse({ priority: 'p1' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid priority', () => {
    const result = requirementListQuerySchema.safeParse({ priority: 'p6' });
    expect(result.success).toBe(false);
  });

  it('accepts status filter', () => {
    const result = requirementListQuerySchema.safeParse({ status: 'draft' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = requirementListQuerySchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });
});
