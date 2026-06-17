import { describe, it, expect } from 'vitest';
import { createProjectSchema, updateProjectSchema, projectListQuerySchema } from '@/lib/validators/project';

describe('createProjectSchema', () => {
  it('validates a valid project', () => {
    const result = createProjectSchema.safeParse({ name: 'My Project', description: 'Test' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createProjectSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = createProjectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding 120 chars', () => {
    const result = createProjectSchema.safeParse({ name: 'a'.repeat(121) });
    expect(result.success).toBe(false);
  });

  it('accepts name with exactly 120 chars', () => {
    const result = createProjectSchema.safeParse({ name: 'a'.repeat(120) });
    expect(result.success).toBe(true);
  });

  it('defaults description to empty string', () => {
    const result = createProjectSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
    }
  });

  it('rejects description exceeding 2000 chars', () => {
    const result = createProjectSchema.safeParse({ name: 'Test', description: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe('updateProjectSchema', () => {
  it('validates valid update with name', () => {
    const result = updateProjectSchema.safeParse({
      name: 'Updated',
      updated_at: '2026-06-15T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with description', () => {
    const result = updateProjectSchema.safeParse({
      description: 'New desc',
      updated_at: '2026-06-15T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates update with status', () => {
    const result = updateProjectSchema.safeParse({
      status: 'paused',
      updated_at: '2026-06-15T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty update body', () => {
    const result = updateProjectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing updated_at', () => {
    const result = updateProjectSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = updateProjectSchema.safeParse({
      status: 'invalid',
      updated_at: '2026-06-15T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('projectListQuerySchema', () => {
  it('returns defaults for empty query', () => {
    const result = projectListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('rejects page size over 50', () => {
    const result = projectListQuerySchema.safeParse({ pageSize: '51' });
    expect(result.success).toBe(false);
  });

  it('rejects page less than 1', () => {
    const result = projectListQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });
});
