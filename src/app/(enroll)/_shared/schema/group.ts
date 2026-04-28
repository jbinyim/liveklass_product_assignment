import { z } from "zod";
import {
  HEADCOUNT_MIN,
  HEADCOUNT_MAX,
} from "@/app/(enroll)/_shared/constants";
import {
  applicantSchema,
  courseIdField,
  agreedToTermsField,
  nameField,
  emailField,
} from "./common";

export const participantSchema = z.object({
  name: nameField,
  email: emailField,
});

export type Participant = z.infer<typeof participantSchema>;

export const groupEnrollmentSchema = z
  .object({
    type: z.literal("group"),
    courseId: courseIdField,
    applicant: applicantSchema,
    group: z.object({
      organizationName: z
        .string()
        .min(1, { message: "단체명을 입력해주세요" }),
      headCount: z
        .number({ message: "인원수를 입력해주세요" })
        .int({ message: "인원수는 정수여야 합니다" })
        .min(HEADCOUNT_MIN, {
          message: `단체 인원은 ${HEADCOUNT_MIN}명 이상이어야 합니다`,
        })
        .max(HEADCOUNT_MAX, {
          message: `단체 인원은 ${HEADCOUNT_MAX}명 이하이어야 합니다`,
        }),
      participants: z.array(participantSchema),
      contactPerson: z
        .string()
        .min(1, { message: "담당자를 입력해주세요" }),
    }),
    agreedToTerms: agreedToTermsField,
  })
  .superRefine((data, ctx) => {
    const { headCount, participants } = data.group;

    if (participants.length !== headCount) {
      ctx.addIssue({
        code: "custom",
        path: ["group", "participants"],
        message: `참가자 수(${participants.length})가 인원수(${headCount})와 일치해야 합니다`,
      });
    }

    const seen = new Map<string, number>();
    participants.forEach((p, i) => {
      const key = p.email.trim().toLowerCase();
      if (!key) return;
      const first = seen.get(key);
      if (first !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["group", "participants", i, "email"],
          message: `${first + 1}번 참가자와 이메일이 중복됩니다`,
        });
      } else {
        seen.set(key, i);
      }
    });

    const applicantEmail = data.applicant.email.trim().toLowerCase();
    if (applicantEmail) {
      participants.forEach((p, i) => {
        if (p.email.trim().toLowerCase() === applicantEmail) {
          ctx.addIssue({
            code: "custom",
            path: ["group", "participants", i, "email"],
            message: "신청자 이메일과 중복됩니다",
          });
        }
      });
    }
  });

export type GroupEnrollment = z.infer<typeof groupEnrollmentSchema>;
