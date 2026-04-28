import { describe, it, expect } from "vitest";
import {
  NAME_MIN,
  NAME_MAX,
  MOTIVATION_MAX,
  HEADCOUNT_MIN,
  HEADCOUNT_MAX,
  SEATS_LOW_THRESHOLD,
  CATEGORIES,
  ENROLLMENT_TYPES,
} from "./constants";

describe("도메인 경계값 (CLAUDE.md 명세 일치)", () => {
  it("이름 2~20자", () => {
    expect(NAME_MIN).toBe(2);
    expect(NAME_MAX).toBe(20);
  });

  it("수강 동기 0~300자", () => {
    expect(MOTIVATION_MAX).toBe(300);
  });

  it("단체 인원수 2~10명", () => {
    expect(HEADCOUNT_MIN).toBe(2);
    expect(HEADCOUNT_MAX).toBe(10);
  });

  it("잔여석 마감임박 임계값 5", () => {
    expect(SEATS_LOW_THRESHOLD).toBe(5);
  });

  it("카테고리 4종 명세 일치", () => {
    expect(CATEGORIES).toEqual([
      "development",
      "design",
      "marketing",
      "business",
    ]);
  });

  it("신청 유형은 personal / group 두 가지", () => {
    expect(ENROLLMENT_TYPES).toEqual(["personal", "group"]);
  });
});
