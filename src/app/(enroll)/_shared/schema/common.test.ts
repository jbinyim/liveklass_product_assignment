import { describe, it, expect } from "vitest";
import { commonSchema } from "./common";
import {
  NAME_MIN,
  NAME_MAX,
  MOTIVATION_MAX,
} from "@/app/(enroll)/_shared/constants";

const valid = {
  courseId: "course-001",
  name: "김민수",
  email: "user@example.com",
  phone: "010-1234-5678",
  motivation: "",
};

describe("commonSchema", () => {
  it("유효 입력 통과", () => {
    expect(commonSchema.safeParse(valid).success).toBe(true);
  });

  describe("courseId", () => {
    it("빈 문자열 거부", () => {
      const r = commonSchema.safeParse({ ...valid, courseId: "" });
      expect(r.success).toBe(false);
    });
  });

  describe("name", () => {
    it(`${NAME_MIN - 1}자 거부`, () => {
      const r = commonSchema.safeParse({ ...valid, name: "김" });
      expect(r.success).toBe(false);
    });
    it(`${NAME_MIN}자 통과`, () => {
      const r = commonSchema.safeParse({ ...valid, name: "김민" });
      expect(r.success).toBe(true);
    });
    it(`${NAME_MAX}자 통과`, () => {
      const r = commonSchema.safeParse({ ...valid, name: "가".repeat(NAME_MAX) });
      expect(r.success).toBe(true);
    });
    it(`${NAME_MAX + 1}자 거부`, () => {
      const r = commonSchema.safeParse({
        ...valid,
        name: "가".repeat(NAME_MAX + 1),
      });
      expect(r.success).toBe(false);
    });
  });

  describe("email", () => {
    it("형식 오류 거부", () => {
      const r = commonSchema.safeParse({ ...valid, email: "not-email" });
      expect(r.success).toBe(false);
    });
    it("유효 이메일 통과", () => {
      const r = commonSchema.safeParse({ ...valid, email: "a@b.co" });
      expect(r.success).toBe(true);
    });
  });

  describe("phone", () => {
    it("한국 형식 통과", () => {
      const r = commonSchema.safeParse({ ...valid, phone: "01012345678" });
      expect(r.success).toBe(true);
    });
    it("미국식 거부", () => {
      const r = commonSchema.safeParse({ ...valid, phone: "123-456-7890" });
      expect(r.success).toBe(false);
    });
  });

  describe("motivation (선택)", () => {
    it("빈 문자열 통과", () => {
      const r = commonSchema.safeParse({ ...valid, motivation: "" });
      expect(r.success).toBe(true);
    });
    it(`${MOTIVATION_MAX}자 통과`, () => {
      const r = commonSchema.safeParse({
        ...valid,
        motivation: "가".repeat(MOTIVATION_MAX),
      });
      expect(r.success).toBe(true);
    });
    it(`${MOTIVATION_MAX + 1}자 거부`, () => {
      const r = commonSchema.safeParse({
        ...valid,
        motivation: "가".repeat(MOTIVATION_MAX + 1),
      });
      expect(r.success).toBe(false);
    });
  });
});
