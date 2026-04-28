import { describe, it, expect } from "vitest";
import { enrollmentDefaults } from "./defaults";
import { HEADCOUNT_MIN } from "./constants";
import { applicantSchema } from "./schema";

describe("enrollmentDefaults", () => {
  it("type 기본값은 personal", () => {
    expect(enrollmentDefaults.type).toBe("personal");
  });

  it("courseId / agreedToTerms 빈 상태", () => {
    expect(enrollmentDefaults.courseId).toBe("");
    expect(enrollmentDefaults.agreedToTerms).toBe(false);
  });

  it("applicant 4 필드 모두 빈 문자열", () => {
    expect(enrollmentDefaults.applicant).toEqual({
      name: "",
      email: "",
      phone: "",
      motivation: "",
    });
  });

  it("group.headCount 기본값은 HEADCOUNT_MIN", () => {
    expect(enrollmentDefaults.group.headCount).toBe(HEADCOUNT_MIN);
  });

  it("group.participants 빈 배열", () => {
    expect(enrollmentDefaults.group.participants).toEqual([]);
  });

  it("기본 applicant 값으로는 schema 통과 안 됨 (필드가 비어 있으므로)", () => {
    expect(applicantSchema.safeParse(enrollmentDefaults.applicant).success).toBe(
      false,
    );
  });
});
