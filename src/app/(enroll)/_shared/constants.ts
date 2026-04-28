export const NAME_MIN = 2;
export const NAME_MAX = 20;

export const MOTIVATION_MAX = 300;

export const HEADCOUNT_MIN = 2;
export const HEADCOUNT_MAX = 10;

export const CATEGORIES = [
  "development",
  "design",
  "marketing",
  "business",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ENROLLMENT_TYPES = ["personal", "group"] as const;

export type EnrollmentType = (typeof ENROLLMENT_TYPES)[number];
