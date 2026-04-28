import { describe, it, expect } from "vitest";
import { applicantSchema, courseIdField } from "./common";
import {
  NAME_MIN,
  NAME_MAX,
  MOTIVATION_MAX,
} from "@/app/(enroll)/_shared/constants";

const valid = {
  name: "김민수",
  email: "user@example.com",
  phone: "010-1234-5678",
  motivation: "",
};

describe("applicantSchema", () => {
  it("유효 입력 통과", () => {
    expect(applicantSchema.safeParse(valid).success).toBe(true);
  });

  describe("name", () => {
    it(`${NAME_MIN - 1}자 거부`, () => {
      expect(applicantSchema.safeParse({ ...valid, name: "김" }).success).toBe(
        false,
      );
    });
    it(`${NAME_MIN}자 통과`, () => {
      expect(
        applicantSchema.safeParse({ ...valid, name: "김민" }).success,
      ).toBe(true);
    });
    it(`${NAME_MAX}자 통과`, () => {
      expect(
        applicantSchema.safeParse({ ...valid, name: "가".repeat(NAME_MAX) })
          .success,
      ).toBe(true);
    });
    it(`${NAME_MAX + 1}자 거부`, () => {
      expect(
        applicantSchema.safeParse({
          ...valid,
          name: "가".repeat(NAME_MAX + 1),
        }).success,
      ).toBe(false);
    });
  });

  describe("email", () => {
    it("형식 오류 거부", () => {
      expect(
        applicantSchema.safeParse({ ...valid, email: "not-email" }).success,
      ).toBe(false);
    });
    it("유효 이메일 통과", () => {
      expect(
        applicantSchema.safeParse({ ...valid, email: "a@b.co" }).success,
      ).toBe(true);
    });
  });

  describe("phone", () => {
    it("한국 형식 통과", () => {
      expect(
        applicantSchema.safeParse({ ...valid, phone: "01012345678" }).success,
      ).toBe(true);
    });
    it("미국식 거부", () => {
      expect(
        applicantSchema.safeParse({ ...valid, phone: "123-456-7890" }).success,
      ).toBe(false);
    });
  });

  describe("motivation (선택)", () => {
    it("빈 문자열 통과", () => {
      expect(
        applicantSchema.safeParse({ ...valid, motivation: "" }).success,
      ).toBe(true);
    });
    it(`${MOTIVATION_MAX}자 통과`, () => {
      expect(
        applicantSchema.safeParse({
          ...valid,
          motivation: "가".repeat(MOTIVATION_MAX),
        }).success,
      ).toBe(true);
    });
    it(`${MOTIVATION_MAX + 1}자 거부`, () => {
      expect(
        applicantSchema.safeParse({
          ...valid,
          motivation: "가".repeat(MOTIVATION_MAX + 1),
        }).success,
      ).toBe(false);
    });
  });
});

describe("courseIdField", () => {
  it("빈 문자열 거부", () => {
    expect(courseIdField.safeParse("").success).toBe(false);
  });
  it("값 있으면 통과", () => {
    expect(courseIdField.safeParse("course-001").success).toBe(true);
  });
});
