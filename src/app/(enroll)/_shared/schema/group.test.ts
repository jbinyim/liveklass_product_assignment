import { describe, it, expect } from "vitest";
import { groupEnrollmentSchema } from "./group";

const baseApplicant = {
  name: "김민수",
  email: "applicant@example.com",
  phone: "010-1111-2222",
  motivation: "",
};

const makeGroup = (
  overrides: Partial<{
    headCount: number;
    participants: { name: string; email: string }[];
    organizationName: string;
    contactPerson: string;
  }> = {},
) => ({
  type: "group" as const,
  courseId: "course-001",
  applicant: baseApplicant,
  group: {
    organizationName: overrides.organizationName ?? "데일리 컴퍼니",
    headCount: overrides.headCount ?? 2,
    participants: overrides.participants ?? [
      { name: "참가자1", email: "p1@example.com" },
      { name: "참가자2", email: "p2@example.com" },
    ],
    contactPerson: overrides.contactPerson ?? "이대리",
  },
  agreedToTerms: true as const,
});

describe("groupEnrollmentSchema", () => {
  it("유효 단체 신청 통과", () => {
    expect(groupEnrollmentSchema.safeParse(makeGroup()).success).toBe(true);
  });

  describe("group.headCount 경계값", () => {
    it("1명 거부", () => {
      expect(
        groupEnrollmentSchema.safeParse(
          makeGroup({
            headCount: 1,
            participants: [{ name: "참가자1", email: "p1@example.com" }],
          }),
        ).success,
      ).toBe(false);
    });
    it("10명 통과", () => {
      const participants = Array.from({ length: 10 }, (_, i) => ({
        name: `참가자${i + 1}`,
        email: `p${i + 1}@example.com`,
      }));
      expect(
        groupEnrollmentSchema.safeParse(
          makeGroup({ headCount: 10, participants }),
        ).success,
      ).toBe(true);
    });
    it("11명 거부", () => {
      const participants = Array.from({ length: 11 }, (_, i) => ({
        name: `참가자${i + 1}`,
        email: `p${i + 1}@example.com`,
      }));
      expect(
        groupEnrollmentSchema.safeParse(
          makeGroup({ headCount: 11, participants }),
        ).success,
      ).toBe(false);
    });
  });

  describe("D003: 참가자 이메일 중복", () => {
    it("참가자 간 동일 이메일 거부 + 중복 인덱스 path", () => {
      const result = groupEnrollmentSchema.safeParse(
        makeGroup({
          participants: [
            { name: "참가자1", email: "dup@example.com" },
            { name: "참가자2", email: "dup@example.com" },
          ],
        }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) =>
            i.path.join(".") === "group.participants.1.email" &&
            i.message.includes("중복"),
        );
        expect(issue).toBeDefined();
      }
    });

    it("대소문자/공백 차이 무시하고 중복 판정", () => {
      expect(
        groupEnrollmentSchema.safeParse(
          makeGroup({
            participants: [
              { name: "참가자1", email: "dup@example.com" },
              { name: "참가자2", email: " DUP@example.com " },
            ],
          }),
        ).success,
      ).toBe(false);
    });

    it("신청자 이메일 = 참가자 이메일 거부 (D002 역할 분리)", () => {
      const result = groupEnrollmentSchema.safeParse({
        ...makeGroup({
          participants: [
            { name: "참가자1", email: "applicant@example.com" }, // applicant와 동일
            { name: "참가자2", email: "p2@example.com" },
          ],
        }),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) =>
          i.message.includes("신청자"),
        );
        expect(issue).toBeDefined();
      }
    });

    it("이메일 모두 고유하면 통과", () => {
      expect(
        groupEnrollmentSchema.safeParse(
          makeGroup({
            participants: [
              { name: "참가자1", email: "p1@example.com" },
              { name: "참가자2", email: "p2@example.com" },
            ],
          }),
        ).success,
      ).toBe(true);
    });
  });

  describe("headCount ↔ participants.length 일치", () => {
    it("불일치 거부 + path는 group.participants", () => {
      const result = groupEnrollmentSchema.safeParse(
        makeGroup({
          headCount: 3,
          participants: [
            { name: "참가자1", email: "p1@example.com" },
            { name: "참가자2", email: "p2@example.com" },
          ],
        }),
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path.join(".") === "group.participants",
        );
        expect(issue).toBeDefined();
      }
    });
  });

  describe("필수 필드", () => {
    it("organizationName 빈값 거부", () => {
      expect(
        groupEnrollmentSchema.safeParse(
          makeGroup({ organizationName: "" }),
        ).success,
      ).toBe(false);
    });
    it("contactPerson 빈값 거부", () => {
      expect(
        groupEnrollmentSchema.safeParse(makeGroup({ contactPerson: "" }))
          .success,
      ).toBe(false);
    });
  });
});
