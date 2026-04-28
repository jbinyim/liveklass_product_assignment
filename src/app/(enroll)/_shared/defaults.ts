import { HEADCOUNT_MIN } from "./constants";
import type { Participant } from "./schema";

export const enrollmentDefaults = {
  type: "personal" as "personal" | "group",
  courseId: "",
  applicant: {
    name: "",
    email: "",
    phone: "",
    motivation: "",
  },
  group: {
    organizationName: "",
    headCount: HEADCOUNT_MIN,
    participants: [] as Participant[],
    contactPerson: "",
  },
  agreedToTerms: false as boolean,
};

export type EnrollmentDefaults = typeof enrollmentDefaults;
