export const REQUIREMENT_TYPE = {
  FUNCTIONAL: 'functional',
  NON_FUNCTIONAL: 'non_functional',
  TECHNICAL: 'technical',
  UX: 'ux',
} as const;

export type RequirementType = (typeof REQUIREMENT_TYPE)[keyof typeof REQUIREMENT_TYPE];

export const REQUIREMENT_PRIORITY = {
  P1: 'p1',
  P2: 'p2',
  P3: 'p3',
  P4: 'p4',
  P5: 'p5',
} as const;

export type RequirementPriority = (typeof REQUIREMENT_PRIORITY)[keyof typeof REQUIREMENT_PRIORITY];

export const REQUIREMENT_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  IMPLEMENTED: 'implemented',
  DEFERRED: 'deferred',
} as const;

export type RequirementStatus = (typeof REQUIREMENT_STATUS)[keyof typeof REQUIREMENT_STATUS];

export const ALLOWED_TRANSITIONS: Record<RequirementStatus, RequirementStatus[]> = {
  draft: ['approved', 'deferred'],
  approved: ['implemented', 'draft'],
  implemented: ['draft'],
  deferred: ['draft'],
};

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 50;
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 3000;
