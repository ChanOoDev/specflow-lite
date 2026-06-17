import { describe, it, expect } from 'vitest';
import { validateTaskStatusTransition } from '@/lib/validators/task';

describe('validateTaskStatusTransition', () => {
  describe('from todo', () => {
    it('allows todo → in_progress', () => {
      expect(validateTaskStatusTransition('todo', 'in_progress')).toEqual({
        valid: true,
      });
    });

    it('rejects todo → done', () => {
      const result = validateTaskStatusTransition('todo', 'done');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('Cannot transition from "todo" to "done"');
        expect(result.message).toContain('in_progress');
      }
    });
  });

  describe('from in_progress', () => {
    it('allows in_progress → done', () => {
      expect(validateTaskStatusTransition('in_progress', 'done')).toEqual({
        valid: true,
      });
    });

    it('allows in_progress → todo', () => {
      expect(validateTaskStatusTransition('in_progress', 'todo')).toEqual({
        valid: true,
      });
    });
  });

  describe('from done', () => {
    it('allows done → in_progress (reopen)', () => {
      expect(validateTaskStatusTransition('done', 'in_progress')).toEqual({
        valid: true,
      });
    });

    it('rejects done → todo', () => {
      const result = validateTaskStatusTransition('done', 'todo');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('Cannot transition from "done" to "todo"');
        expect(result.message).toContain('in_progress');
      }
    });
  });

  describe('unknown status', () => {
    it('rejects unknown source status', () => {
      const result = validateTaskStatusTransition('unknown', 'todo');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('Unknown status');
      }
    });
  });

  describe('error message formatting', () => {
    it('includes allowed transitions in error message', () => {
      const result = validateTaskStatusTransition('todo', 'done');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('in_progress');
      }
    });
  });
});
