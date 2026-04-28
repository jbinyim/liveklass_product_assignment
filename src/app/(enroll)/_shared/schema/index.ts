import { z } from "zod";
import { personalEnrollmentSchema } from "./personal";
import { groupEnrollmentSchema } from "./group";

export { applicantSchema, courseIdField, agreedToTermsField } from "./common";
export type { Applicant } from "./common";
export { personalEnrollmentSchema } from "./personal";
export type { PersonalEnrollment } from "./personal";
export {
  groupEnrollmentSchema,
  participantSchema,
} from "./group";
export type { GroupEnrollment, Participant } from "./group";
export { STEPS, STEP_FIELDS } from "./step";
export type { Step } from "./step";

export const enrollmentSchema = z.discriminatedUnion("type", [
  personalEnrollmentSchema,
  groupEnrollmentSchema,
]);

export type EnrollmentForm = z.infer<typeof enrollmentSchema>;
