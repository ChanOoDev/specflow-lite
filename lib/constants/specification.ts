export const SPECIFICATION_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  APPROVED: 'approved',
  ARCHIVED: 'archived',
} as const;

export type SpecificationStatus =
  (typeof SPECIFICATION_STATUS)[keyof typeof SPECIFICATION_STATUS];

export const ALLOWED_TRANSITIONS: Record<
  SpecificationStatus,
  SpecificationStatus[]
> = {
  draft: ['in_progress', 'archived'],
  in_progress: ['completed', 'draft'],
  completed: ['approved', 'draft'],
  approved: [],
  archived: ['draft'],
};

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 50;
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 5000;
