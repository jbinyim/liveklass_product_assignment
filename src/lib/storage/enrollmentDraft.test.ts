import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DRAFT_KEY,
  DRAFT_TTL_MS,
  saveDraft,
  loadDraft,
  clearDraft,
} from "./enrollmentDraft";
import { enrollmentDefaults } from "@/app/(enroll)/_shared/defaults";

const sample = {
  ...enrollmentDefaults,
  courseId: "course-001",
  applicant: {
    name: "김민수",
    email: "user@example.com",
    phone: "010-1234-5678",
    motivation: "동기",
  },
  agreedToTerms: true,
};

describe("enrollmentDraft", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("saveDraft", () => {
    it("저장한 데이터를 loadDraft로 복원", () => {
      saveDraft(sample);
      const loaded = loadDraft();
      expect(loaded).not.toBeNull();
      expect(loaded?.courseId).toBe("course-001");
      expect(loaded?.applicant.name).toBe("김민수");
    });

    it("agreedToTerms는 저장 범위에서 제외 (D006-e)", () => {
      saveDraft(sample);
      const raw = localStorage.getItem(DRAFT_KEY);
      expect(raw).not.toBeNull();
      expect(raw).not.toContain("agreedToTerms");
    });

    it("savedAt 타임스탬프 포함", () => {
      const now = 1_700_000_000_000;
      vi.useFakeTimers();
      vi.setSystemTime(now);
      saveDraft(sample);
      const stored = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}");
      expect(stored.savedAt).toBe(now);
    });
  });

  describe("loadDraft", () => {
    it("없으면 null", () => {
      expect(loadDraft()).toBeNull();
    });

    it("손상된 JSON이면 null + 자동 폐기", () => {
      localStorage.setItem(DRAFT_KEY, "{not-json");
      expect(loadDraft()).toBeNull();
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it("TTL 초과 시 null + 자동 폐기", () => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
      saveDraft(sample);
      vi.setSystemTime(DRAFT_TTL_MS + 1);
      expect(loadDraft()).toBeNull();
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it("TTL 경계 직전(24h - 1ms)은 통과", () => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
      saveDraft(sample);
      vi.setSystemTime(DRAFT_TTL_MS - 1);
      expect(loadDraft()).not.toBeNull();
    });

    it("형태 불일치 (savedAt 없음) 거부", () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data: {} }));
      expect(loadDraft()).toBeNull();
    });
  });

  describe("clearDraft", () => {
    it("키 제거", () => {
      saveDraft(sample);
      clearDraft();
      expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    });

    it("이미 없어도 throw 안 함", () => {
      expect(() => clearDraft()).not.toThrow();
    });
  });
});
