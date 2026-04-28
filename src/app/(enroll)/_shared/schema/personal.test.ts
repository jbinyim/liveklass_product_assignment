import { describe, it, expect } from "vitest";
import { personalEnrollmentSchema } from "./personal";

const validPersonal = {
  type: "personal" as const,
  courseId: "course-001",
  applicant: {
    name: "김민수",
    email: "user@example.com",
    phone: "010-1234-5678",
    motivation: "",
  },
  agreedToTerms: true as const,
};

describe("personalEnrollmentSchema", () => {
  it("유효 입력 통과", () => {
    expect(personalEnrollmentSchema.safeParse(validPersonal).success).toBe(true);
  });

  it("type !== personal 거부", () => {
    expect(
      personalEnrollmentSchema.safeParse({ ...validPersonal, type: "group" })
        .success,
    ).toBe(false);
  });

  it("courseId 빈값 거부", () => {
    expect(
      personalEnrollmentSchema.safeParse({ ...validPersonal, courseId: "" })
        .success,
    ).toBe(false);
  });

  it("agreedToTerms === false 거부", () => {
    expect(
      personalEnrollmentSchema.safeParse({
        ...validPersonal,
        agreedToTerms: false,
      }).success,
    ).toBe(false);
  });

  it("applicant 내부 필드 검증 전이 (이메일 형식)", () => {
    expect(
      personalEnrollmentSchema.safeParse({
        ...validPersonal,
        applicant: { ...validPersonal.applicant, email: "x" },
      }).success,
    ).toBe(false);
  });
});
