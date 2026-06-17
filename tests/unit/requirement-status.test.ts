import { describe, it, expect } from 'vitest';
import { validateRequirementStatusTransition } from '@/lib/validators/requirement';

describe('validateRequirementStatusTransition', () => {
  describe('valid transitions', () => {
    it('draft → approved', () => {
      expect(validateRequirementStatusTransition('draft', 'approved')).toEqual({
        valid: true,
      });
    });

    it('draft → deferred', () => {
      expect(validateRequirementStatusTransition('draft', 'deferred')).toEqual({
        valid: true,
      });
    });

    it('approved → implemented', () => {
      expect(
        validateRequirementStatusTransition('approved', 'implemented')
      ).toEqual({ valid: true });
    });

    it('approved → draft', () => {
      expect(validateRequirementStatusTransition('approved', 'draft')).toEqual({
        valid: true,
      });
    });

    it('implemented → draft', () => {
      expect(
        validateRequirementStatusTransition('implemented', 'draft')
      ).toEqual({ valid: true });
    });

    it('deferred → draft', () => {
      expect(validateRequirementStatusTransition('deferred', 'draft')).toEqual({
        valid: true,
      });
    });
  });

  describe('invalid transitions', () => {
    it('draft → implemented (skip approved)', () => {
      const result = validateRequirementStatusTransition(
        'draft',
        'implemented'
      );
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('Cannot transition');
      }
    });

    it('approved → deferred (no direct path)', () => {
      const result = validateRequirementStatusTransition(
        'approved',
        'deferred'
      );
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('Cannot transition');
      }
    });

    it('implemented → approved (no backward)', () => {
      const result = validateRequirementStatusTransition(
        'implemented',
        'approved'
      );
      expect(result.valid).toBe(false);
    });

    it('implemented → deferred (no direct path)', () => {
      const result = validateRequirementStatusTransition(
        'implemented',
        'deferred'
      );
      expect(result.valid).toBe(false);
    });

    it('deferred → approved (must go through draft)', () => {
      const result = validateRequirementStatusTransition(
        'deferred',
        'approved'
      );
      expect(result.valid).toBe(false);
    });

    it('deferred → implemented (must go through draft)', () => {
      const result = validateRequirementStatusTransition(
        'deferred',
        'implemented'
      );
      expect(result.valid).toBe(false);
    });

    it('draft → draft (no-op)', () => {
      const result = validateRequirementStatusTransition('draft', 'draft');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.message).toContain('Cannot transition');
      }
    });

    it('approved → approved (no-op)', () => {
      const result = validateRequirementStatusTransition('approved', 'approved');
      expect(result.valid).toBe(false);
    });

    it('implemented → implemented (no-op)', () => {
      const result = validateRequirementStatusTransition(
        'implemented',
        'implemented'
      );
      expect(result.valid).toBe(false);
    });

    it('deferred → deferred (no-op)', () => {
      const result = validateRequirementStatusTransition(
        'deferred',
        'deferred'
      );
      expect(result.valid).toBe(false);
    });
  });

  it('returns error for unknown current status', () => {
    const result = validateRequirementStatusTransition('unknown', 'draft');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toContain('Unknown status');
    }
  });
});
