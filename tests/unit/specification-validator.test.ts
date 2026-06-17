import { describe, it, expect } from 'vitest';
import {
  createSpecificationSchema,
  updateSpecificationSchema,
  specificationListQuerySchema,
} from '@/lib/validators/specification';

describe('createSpecificationSchema', () => {
  it('validates a valid specification', () => {
    const result = createSpecificationSchema.safeParse({
      title: 'Auth System Spec',
    });
    expect(result.success).toBe(true);
  });

  it('validates with optional description', () => {
    const result = createSpecificationSchema.safeParse({
      title: 'API Design Spec',
      description: 'RESTful API design for user management',
    });
    expect(result.success).toBe(true);
  });

  it('validates with linked requirement ids', () => {
    const result = createSpecificationSchema.safeParse({
      title: 'Database Schema Spec',
      linked_requirement_ids: [
        '123e4567-e89b-12d3-a456-426614174000',
        '223e4567-e89b-12d3-a456-426614174001',
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createSpecificationSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const result = createSpecificationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 200 chars', () => {
    const result = createSpecificationSchema.safeParse({
      title: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('accepts title with exactly 200 chars', () => {
    const result = createSpecificationSchema.safeParse({
      title: 'a'.repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it('defaults description to empty string', () => {
    const result = createSpecificationSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
    }
  });

  it('defaults linked_requirement_ids to empty array', () => {
    const result = createSpecificationSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.linked_requirement_ids).toEqual([]);
    }
  });

  it('rejects description exceeding 5000 chars', () => {
    const result = createSpecificationSchema.safeParse({
      title: 'Test',
      description: 'a'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-UUID linked_requirement_ids', () => {
    const result = createSpecificationSchema.safeParse({
      title: 'Test',
      linked_requirement_ids: ['not-a-uuid'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 50 linked requirements', () => {
    const result = createSpecificationSchema.safeParse({
      title: 'Test',
      linked_requirement_ids: Array.from({ length: 51 }, (_, i) =>
        `123e4567-e89b-12d3-a456-${String(i).padStart(12, '0')}`
      ),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateSpecificationSchema', () => {
  it('validates update with title', () => {
    const result = updateSpecificationSchema.safeParse({
      title: 'Updated Title',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with description', () => {
    const result = updateSpecificationSchema.safeParse({
      description: 'Updated description',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with status', () => {
    const result = updateSpecificationSchema.safeParse({
      status: 'in_progress',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with linked_requirement_ids', () => {
    const result = updateSpecificationSchema.safeParse({
      linked_requirement_ids: [
        '123e4567-e89b-12d3-a456-426614174000',
      ],
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty update body', () => {
    const result = updateSpecificationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing updated_at', () => {
    const result = updateSpecificationSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = updateSpecificationSchema.safeParse({
      status: 'invalid',
      updated_at: '2026-06-17T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('validates updated_at with timezone offset', () => {
    const result = updateSpecificationSchema.safeParse({
      title: 'Test',
      updated_at: '2026-06-17T00:00:00.000+08:00',
    });
    expect(result.success).toBe(true);
  });
});

describe('specificationListQuerySchema', () => {
  it('returns defaults for empty query', () => {
    const result = specificationListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('rejects page size over 50', () => {
    const result = specificationListQuerySchema.safeParse({ pageSize: '51' });
    expect(result.success).toBe(false);
  });

  it('rejects page less than 1', () => {
    const result = specificationListQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('accepts optional search filter', () => {
    const result = specificationListQuerySchema.safeParse({ search: 'auth' });
    expect(result.success).toBe(true);
  });

  it('accepts status filter', () => {
    const result = specificationListQuerySchema.safeParse({ status: 'draft' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = specificationListQuerySchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid statuses', () => {
    for (const status of [
      'draft',
      'in_progress',
      'completed',
      'approved',
      'archived',
    ]) {
      const result = specificationListQuerySchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });
});
