import { z } from "zod";
import {
  applicantSchema,
  courseIdField,
  agreedToTermsField,
} from "./common";

export const personalEnrollmentSchema = z.object({
  type: z.literal("personal"),
  courseId: courseIdField,
  applicant: applicantSchema,
  agreedToTerms: agreedToTermsField,
});

export type PersonalEnrollment = z.infer<typeof personalEnrollmentSchema>;
