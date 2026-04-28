import { z } from "zod";
import {
  NAME_MIN,
  NAME_MAX,
  MOTIVATION_MAX,
} from "@/app/(enroll)/_shared/constants";
import { isKoreanPhone } from "@/lib/validators/phone";

export const courseIdField = z
  .string()
  .min(1, { message: "강의를 선택해주세요" });

export const nameField = z
  .string()
  .min(NAME_MIN, { message: `이름은 ${NAME_MIN}자 이상이어야 합니다` })
  .max(NAME_MAX, { message: `이름은 ${NAME_MAX}자 이하이어야 합니다` });

export const emailField = z.email({ message: "올바른 이메일 형식이 아닙니다" });

export const phoneField = z
  .string()
  .refine(isKoreanPhone, { message: "올바른 전화번호 형식이 아닙니다" });

export const motivationField = z.string().max(MOTIVATION_MAX, {
  message: `수강 동기는 ${MOTIVATION_MAX}자 이하이어야 합니다`,
});

export const agreedToTermsField = z.literal(true, {
  message: "약관에 동의해야 합니다",
});

export const applicantSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  motivation: motivationField,
});

export type Applicant = z.infer<typeof applicantSchema>;
