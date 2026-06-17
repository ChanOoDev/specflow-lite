import { describe, it, expect } from 'vitest';
import { validateStatusTransition } from '@/lib/validators/project';

describe('validateStatusTransition', () => {
  describe('valid transitions', () => {
    it('active → paused', () => {
      expect(validateStatusTransition('active', 'paused')).toEqual({ valid: true });
    });

    it('active → completed', () => {
      expect(validateStatusTransition('active', 'completed')).toEqual({ valid: true });
    });

    it('active → archived', () => {
      expect(validateStatusTransition('active', 'archived')).toEqual({ valid: true });
    });

    it('paused → active', () => {
      expect(validateStatusTransition('paused', 'active')).toEqual({ valid: true });
    });

    it('paused → archived', () => {
      expect(validateStatusTransition('paused', 'archived')).toEqual({ valid: true });
    });

    it('completed → archived', () => {
      expect(validateStatusTransition('completed', 'archived')).toEqual({ valid: true });
    });

    it('archived → active', () => {
      expect(validateStatusTransition('archived', 'active')).toEqual({ valid: true });
    });
  });

  describe('invalid transitions', () => {
    it('active → active (no-op)', () => {
      const result = validateStatusTransition('active', 'active');
      expect(result.valid).toBe(false);
    });

    it('completed → active', () => {
      const result = validateStatusTransition('completed', 'active');
      expect(result.valid).toBe(false);
    });

    it('completed → paused', () => {
      const result = validateStatusTransition('completed', 'paused');
      expect(result.valid).toBe(false);
    });

    it('archived → paused', () => {
      const result = validateStatusTransition('archived', 'paused');
      expect(result.valid).toBe(false);
    });

    it('archived → completed', () => {
      const result = validateStatusTransition('archived', 'completed');
      expect(result.valid).toBe(false);
    });

    it('archived → archived (no-op)', () => {
      const result = validateStatusTransition('archived', 'archived');
      expect(result.valid).toBe(false);
    });

    it('paused → completed', () => {
      const result = validateStatusTransition('paused', 'completed');
      expect(result.valid).toBe(false);
    });

    it('completed → completed (no-op)', () => {
      const result = validateStatusTransition('completed', 'completed');
      expect(result.valid).toBe(false);
    });

    it('paused → paused (no-op)', () => {
      const result = validateStatusTransition('paused', 'paused');
      expect(result.valid).toBe(false);
    });
  });

  it('returns error for unknown status', () => {
    const result = validateStatusTransition('unknown', 'active');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toContain('Unknown status');
    }
  });
});
