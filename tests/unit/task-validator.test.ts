import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema, taskListQuerySchema } from '@/lib/validators/task';

describe('createTaskSchema', () => {
  it('accepts valid input with title and description', () => {
    const result = createTaskSchema.safeParse({
      title: 'Set up database schema',
      description: 'Create the tasks table with indexes',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Set up database schema');
      expect(result.data.description).toBe('Create the tasks table with indexes');
    }
  });

  it('accepts input with title only (description defaults to empty string)', () => {
    const result = createTaskSchema.safeParse({ title: 'Minimal task' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
    }
  });

  it('rejects empty title', () => {
    const result = createTaskSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toBeDefined();
    }
  });

  it('rejects whitespace-only title', () => {
    const result = createTaskSchema.safeParse({ title: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toBeDefined();
    }
  });

  it('rejects title exceeding 200 characters', () => {
    const result = createTaskSchema.safeParse({
      title: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toBeDefined();
    }
  });

  it('accepts title exactly 200 characters', () => {
    const result = createTaskSchema.safeParse({
      title: 'A'.repeat(200),
    });
    expect(result.success).toBe(true);
  });

  it('rejects description exceeding 5000 characters', () => {
    const result = createTaskSchema.safeParse({
      title: 'Valid title',
      description: 'A'.repeat(5001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.description).toBeDefined();
    }
  });

  it('trims leading/trailing whitespace from title', () => {
    const result = createTaskSchema.safeParse({
      title: '  Task title  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Task title');
    }
  });
});

describe('updateTaskSchema', () => {
  it('accepts title-only update with updated_at', () => {
    const result = updateTaskSchema.safeParse({
      title: 'Updated title',
      updated_at: '2026-06-18T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts description-only update with updated_at', () => {
    const result = updateTaskSchema.safeParse({
      description: 'Updated description',
      updated_at: '2026-06-18T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts status-only update with updated_at', () => {
    const result = updateTaskSchema.safeParse({
      status: 'in_progress',
      updated_at: '2026-06-18T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts position-only update with updated_at', () => {
    const result = updateTaskSchema.safeParse({
      position: 3,
      updated_at: '2026-06-18T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects update with no fields beyond updated_at', () => {
    const result = updateTaskSchema.safeParse({
      updated_at: '2026-06-18T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(result.error.issues.some((i: { message: string }) =>
        i.message.includes('At least one field')
      )).toBe(true);
    }
  });

  it('rejects update without updated_at', () => {
    const result = updateTaskSchema.safeParse({ title: 'No timestamp' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status value', () => {
    const result = updateTaskSchema.safeParse({
      status: 'blocked',
      updated_at: '2026-06-18T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects position less than 1', () => {
    const result = updateTaskSchema.safeParse({
      position: 0,
      updated_at: '2026-06-18T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('taskListQuerySchema', () => {
  it('provides defaults when no params given', () => {
    const result = taskListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('accepts valid search and status params', () => {
    const result = taskListQuerySchema.safeParse({
      search: 'database',
      status: 'todo',
      page: '2',
      pageSize: '10',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe('database');
      expect(result.data.status).toBe('todo');
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(10);
    }
  });

  it('rejects pageSize over 50', () => {
    const result = taskListQuerySchema.safeParse({ pageSize: '51' });
    expect(result.success).toBe(false);
  });

  it('rejects page less than 1', () => {
    const result = taskListQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status value', () => {
    const result = taskListQuerySchema.safeParse({ status: 'blocked' });
    expect(result.success).toBe(false);
  });
});
