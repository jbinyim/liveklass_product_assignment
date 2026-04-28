import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCourses } from "./courses";
import { submitEnrollment } from "./enrollments";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("도메인 API 함수", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getCourses는 GET /api/courses 호출", async () => {
    fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200, { courses: [], categories: [] }));
    const data = await getCourses();
    expect(data).toEqual({ courses: [], categories: [] });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/courses",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("getCourses(category)는 query parameter 포함", async () => {
    fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(200, { courses: [], categories: [] }));
    await getCourses("design");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/courses?category=design",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("submitEnrollment은 POST /api/enrollments + body 직렬화", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(200, {
        enrollmentId: "e-1",
        status: "confirmed",
        enrolledAt: "2026-04-28T00:00:00Z",
      }),
    );
    const req = {
      type: "personal" as const,
      courseId: "c-1",
      applicant: {
        name: "김민수",
        email: "u@x.com",
        phone: "010-1234-5678",
        motivation: "",
      },
      agreedToTerms: true as const,
    };
    const res = await submitEnrollment(req);
    expect(res.enrollmentId).toBe("e-1");
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/enrollments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(req),
      }),
    );
  });
});
