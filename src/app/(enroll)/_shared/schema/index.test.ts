import { describe, it, expect } from "vitest";
import { enrollmentSchema } from "./index";

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

const validGroup = {
  type: "group" as const,
  courseId: "course-001",
  applicant: {
    name: "김민수",
    email: "applicant@example.com",
    phone: "010-1111-2222",
    motivation: "",
  },
  group: {
    organizationName: "데일리 컴퍼니",
    headCount: 2,
    participants: [
      { name: "참가자1", email: "p1@example.com" },
      { name: "참가자2", email: "p2@example.com" },
    ],
    contactPerson: "이대리",
  },
  agreedToTerms: true as const,
};

describe("enrollmentSchema (discriminated union by type)", () => {
  it("personal 분기 통과", () => {
    expect(enrollmentSchema.safeParse(validPersonal).success).toBe(true);
  });

  it("group 분기 통과", () => {
    expect(enrollmentSchema.safeParse(validGroup).success).toBe(true);
  });

  it("type 누락 거부", () => {
    const rest: Record<string, unknown> = { ...validPersonal };
    delete rest.type;
    expect(enrollmentSchema.safeParse(rest).success).toBe(false);
  });

  it("type 값이 personal인데 group 필드가 섞여 있어도 personal 분기로만 검증", () => {
    const mixed = { ...validPersonal, group: validGroup.group };
    // personal 분기엔 group 키가 없지만 z.object는 기본 strip이므로 추가 키는 통과
    expect(enrollmentSchema.safeParse(mixed).success).toBe(true);
  });

  it("type === group인데 group 블록 누락 거부", () => {
    const rest: Record<string, unknown> = { ...validGroup };
    delete rest.group;
    expect(enrollmentSchema.safeParse(rest).success).toBe(false);
  });
});
