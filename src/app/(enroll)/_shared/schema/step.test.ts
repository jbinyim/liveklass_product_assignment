import { describe, it, expect } from "vitest";
import { STEPS, STEP_FIELDS } from "./step";

describe("STEPS", () => {
  it("순서: course → applicant → review", () => {
    expect(STEPS).toEqual(["course", "applicant", "review"]);
  });
});

describe("STEP_FIELDS", () => {
  it("course 단계는 type + courseId", () => {
    expect(STEP_FIELDS.course).toEqual(["type", "courseId"]);
  });

  it("applicant 단계는 applicant + group (단체일 때만 group 검증)", () => {
    expect(STEP_FIELDS.applicant).toEqual(["applicant", "group"]);
  });

  it("review 단계는 agreedToTerms", () => {
    expect(STEP_FIELDS.review).toEqual(["agreedToTerms"]);
  });

  it("STEPS의 모든 키를 커버", () => {
    for (const step of STEPS) {
      expect(STEP_FIELDS[step]).toBeDefined();
    }
  });
});
