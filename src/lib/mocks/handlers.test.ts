import { describe, it, expect } from "vitest";
import { fetcher } from "@/lib/api/fetcher";
import { ApiError } from "@/lib/api/ApiError";
import { getCourses } from "@/app/(enroll)/_shared/api/courses";
import { submitEnrollment } from "@/app/(enroll)/_shared/api/enrollments";
import type {
  EnrollmentRequest,
  EnrollmentResponse,
} from "@/app/(enroll)/_shared/api/types";

const validPersonal = (overrides?: Partial<EnrollmentRequest>): EnrollmentRequest => ({
  type: "personal",
  courseId: "course-001",
  applicant: {
    name: "김민수",
    email: "user@example.com",
    phone: "010-1234-5678",
    motivation: "",
  },
  agreedToTerms: true,
  ...overrides,
} as EnrollmentRequest);

describe("MSW handlers", () => {
  describe("GET /api/courses", () => {
    it("CourseListResponse 반환 + 카테고리 4종 모두 포함", async () => {
      const res = await getCourses();
      expect(res.courses.length).toBeGreaterThan(0);
      expect(res.categories).toEqual([
        "development",
        "design",
        "marketing",
        "business",
      ]);
    });

    it("정원 마감 강의 (course-003) 포함", async () => {
      const res = await getCourses();
      const full = res.courses.find((c) => c.id === "course-003");
      expect(full).toBeDefined();
      expect(full?.currentEnrollment).toBe(full?.maxCapacity);
    });

    it("category 파라미터로 서버 필터링", async () => {
      const res = await getCourses("design");
      expect(res.courses.every((c) => c.category === "design")).toBe(true);
    });
  });

  describe("POST /api/enrollments — 성공", () => {
    it("개인 신청 성공 → 201 + enrollmentId", async () => {
      const res = await submitEnrollment(validPersonal());
      expect(res.enrollmentId).toMatch(/^enr-/);
      expect(res.status).toBe("confirmed");
    });

    it("currentEnrollment 1 증가", async () => {
      const before = (await getCourses()).courses.find(
        (c) => c.id === "course-001",
      );
      await submitEnrollment(validPersonal());
      const after = (await getCourses()).courses.find(
        (c) => c.id === "course-001",
      );
      expect(after?.currentEnrollment).toBe((before?.currentEnrollment ?? 0) + 1);
    });
  });

  describe("POST /api/enrollments — INVALID_INPUT", () => {
    it("빈 body → 400 + INVALID_INPUT", async () => {
      await expect(
        fetcher<EnrollmentResponse>("/api/enrollments", {
          method: "POST",
          body: {},
        }),
      ).rejects.toMatchObject({
        kind: "business",
        code: "INVALID_INPUT",
        httpStatus: 400,
      });
    });

    it("잘못된 이메일 → details에 path 매핑", async () => {
      try {
        await submitEnrollment(
          validPersonal({
            applicant: {
              name: "김민수",
              email: "not-email",
              phone: "010-1234-5678",
              motivation: "",
            },
          } as Partial<EnrollmentRequest>),
        );
        throw new Error("should have thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiErr = err as ApiError;
        expect(apiErr.code).toBe("INVALID_INPUT");
        expect(apiErr.details).toBeDefined();
        expect(Object.keys(apiErr.details ?? {})).toContain("applicant.email");
      }
    });
  });

  describe("POST /api/enrollments — COURSE_FULL", () => {
    it("정원 마감 강의(course-003) 신청 거부", async () => {
      await expect(
        submitEnrollment(validPersonal({ courseId: "course-003" })),
      ).rejects.toMatchObject({
        kind: "business",
        code: "COURSE_FULL",
        httpStatus: 409,
      });
    });

    it("단체 인원이 잔여석 초과", async () => {
      // course-002: maxCapacity 20, currentEnrollment 17 → 잔여 3
      const groupReq: EnrollmentRequest = {
        type: "group",
        courseId: "course-002",
        applicant: {
          name: "김민수",
          email: "g@example.com",
          phone: "010-1234-5678",
          motivation: "",
        },
        group: {
          organizationName: "테스트 컴퍼니",
          headCount: 5,
          participants: Array.from({ length: 5 }, (_, i) => ({
            name: `참가자${i + 1}`,
            email: `p${i + 1}@example.com`,
          })),
          contactPerson: "이대리",
        },
        agreedToTerms: true,
      };
      await expect(submitEnrollment(groupReq)).rejects.toMatchObject({
        code: "COURSE_FULL",
      });
    });
  });

  describe("POST /api/enrollments — DUPLICATE_ENROLLMENT", () => {
    it("화이트리스트 이메일(duplicate@example.com) 거부", async () => {
      await expect(
        submitEnrollment(
          validPersonal({
            applicant: {
              name: "김민수",
              email: "duplicate@example.com",
              phone: "010-1234-5678",
              motivation: "",
            },
          } as Partial<EnrollmentRequest>),
        ),
      ).rejects.toMatchObject({
        kind: "business",
        code: "DUPLICATE_ENROLLMENT",
        httpStatus: 409,
      });
    });

    it("같은 (courseId, email) 두 번째 시도 거부", async () => {
      const req = validPersonal({
        applicant: {
          name: "김민수",
          email: "twice@example.com",
          phone: "010-1234-5678",
          motivation: "",
        },
      } as Partial<EnrollmentRequest>);
      await submitEnrollment(req);
      await expect(submitEnrollment(req)).rejects.toMatchObject({
        code: "DUPLICATE_ENROLLMENT",
      });
    });

    it("같은 이메일 + 다른 강의는 허용", async () => {
      await submitEnrollment(
        validPersonal({
          courseId: "course-001",
          applicant: {
            name: "김민수",
            email: "cross@example.com",
            phone: "010-1234-5678",
            motivation: "",
          },
        } as Partial<EnrollmentRequest>),
      );
      const res = await submitEnrollment(
        validPersonal({
          courseId: "course-004",
          applicant: {
            name: "김민수",
            email: "cross@example.com",
            phone: "010-1234-5678",
            motivation: "",
          },
        } as Partial<EnrollmentRequest>),
      );
      expect(res.status).toBe("confirmed");
    });
  });
});

describe("vitest lifecycle: resetMockState", () => {
  it("각 테스트마다 currentEnrollment 초기화 (앞 테스트 영향 없음)", async () => {
    // 직전 describe들에서 course-001을 여러 번 등록했지만 reset 됐어야 함
    const c = (await getCourses()).courses.find((c) => c.id === "course-001");
    expect(c?.currentEnrollment).toBe(12);
  });
});
