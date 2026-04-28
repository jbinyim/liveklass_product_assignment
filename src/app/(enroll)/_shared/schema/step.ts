export const STEPS = ["course", "applicant", "review"] as const;

export type Step = (typeof STEPS)[number];

export const STEP_FIELDS = {
  course: ["type", "courseId"],
  applicant: ["applicant", "group"],
  review: ["agreedToTerms"],
} as const satisfies Record<Step, readonly string[]>;
