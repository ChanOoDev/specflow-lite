import { describe, it, expect } from 'vitest';
import { validateSpecificationStatusTransition } from '@/lib/validators/specification';

describe('validateSpecificationStatusTransition', () => {
  describe('from draft', () => {
    it('allows draft → in_progress', () => {
      expect(validateSpecificationStatusTransition('draft', 'in_progress')).toEqual({
        valid: true,
      });
    });

    it('allows draft → archived', () => {
      expect(validateSpecificationStatusTransition('draft', 'archived')).toEqual({
        valid: true,
      });
    });

    it('rejects draft → completed', () => {
      const result = validateSpecificationStatusTransition('draft', 'completed');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('Cannot transition from "draft" to "completed"');
      }
    });

    it('rejects draft → approved', () => {
      const result = validateSpecificationStatusTransition('draft', 'approved');
      expect(result.valid).toBe(false);
    });
  });

  describe('from in_progress', () => {
    it('allows in_progress → completed', () => {
      expect(validateSpecificationStatusTransition('in_progress', 'completed')).toEqual({
        valid: true,
      });
    });

    it('allows in_progress → draft', () => {
      expect(validateSpecificationStatusTransition('in_progress', 'draft')).toEqual({
        valid: true,
      });
    });

    it('rejects in_progress → approved', () => {
      const result = validateSpecificationStatusTransition('in_progress', 'approved');
      expect(result.valid).toBe(false);
    });

    it('rejects in_progress → archived', () => {
      const result = validateSpecificationStatusTransition('in_progress', 'archived');
      expect(result.valid).toBe(false);
    });
  });

  describe('from completed', () => {
    it('allows completed → approved', () => {
      expect(validateSpecificationStatusTransition('completed', 'approved')).toEqual({
        valid: true,
      });
    });

    it('allows completed → draft', () => {
      expect(validateSpecificationStatusTransition('completed', 'draft')).toEqual({
        valid: true,
      });
    });

    it('rejects completed → in_progress', () => {
      const result = validateSpecificationStatusTransition('completed', 'in_progress');
      expect(result.valid).toBe(false);
    });
  });

  describe('from approved (terminal)', () => {
    it('rejects approved → draft', () => {
      const result = validateSpecificationStatusTransition('approved', 'draft');
      expect(result.valid).toBe(false);
    });

    it('rejects approved → in_progress', () => {
      const result = validateSpecificationStatusTransition('approved', 'in_progress');
      expect(result.valid).toBe(false);
    });

    it('rejects approved → completed', () => {
      const result = validateSpecificationStatusTransition('approved', 'completed');
      expect(result.valid).toBe(false);
    });

    it('rejects approved → archived', () => {
      const result = validateSpecificationStatusTransition('approved', 'archived');
      expect(result.valid).toBe(false);
    });
  });

  describe('from archived', () => {
    it('allows archived → draft', () => {
      expect(validateSpecificationStatusTransition('archived', 'draft')).toEqual({
        valid: true,
      });
    });

    it('rejects archived → in_progress', () => {
      const result = validateSpecificationStatusTransition('archived', 'in_progress');
      expect(result.valid).toBe(false);
    });
  });

  describe('unknown status', () => {
    it('rejects unknown source status', () => {
      const result = validateSpecificationStatusTransition('unknown', 'draft');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('Unknown status');
      }
    });
  });

  describe('error message formatting', () => {
    it('includes allowed transitions in error message', () => {
      const result = validateSpecificationStatusTransition('draft', 'approved');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('in_progress');
        expect(result.message).toContain('archived');
      }
    });

    it('shows "none" for terminal approved status', () => {
      const result = validateSpecificationStatusTransition('approved', 'draft');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('none');
      }
    });
  });
});
