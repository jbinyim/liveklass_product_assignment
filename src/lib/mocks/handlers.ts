import { http, HttpResponse, delay } from "msw";
import { enrollmentSchema } from "@/app/(enroll)/_shared/schema";
import { CATEGORIES } from "@/app/(enroll)/_shared/constants";
import type {
  CourseListResponse,
  EnrollmentResponse,
  ErrorResponse,
} from "@/app/(enroll)/_shared/api/types";
import {
  getMockCourses,
  findMockCourse,
  incrementEnrollment,
  isDuplicateEnrollment,
  addEnrollment,
} from "./data";

function errorBody(
  code: ErrorResponse["code"],
  message: string,
  details?: Record<string, string>,
): ErrorResponse {
  return details ? { code, message, details } : { code, message };
}

function zodIssuesToDetails(
  issues: readonly { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export const handlers = [
  http.get("/api/courses", async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const all = getMockCourses();
    const courses =
      category && category !== "all"
        ? all.filter((c) => c.category === category)
        : all;
    const body: CourseListResponse = {
      courses,
      categories: [...CATEGORIES],
    };
    return HttpResponse.json(body);
  }),

  http.post("/api/enrollments", async ({ request }) => {
    await delay(200);

    const body = (await request.json().catch(() => null)) as unknown;

    const parsed = enrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json(
        errorBody(
          "INVALID_INPUT",
          "입력값을 확인해주세요",
          zodIssuesToDetails(parsed.error.issues),
        ),
        { status: 400 },
      );
    }

    const data = parsed.data;
    const course = findMockCourse(data.courseId);
    if (!course) {
      return HttpResponse.json(
        errorBody("INVALID_INPUT", "강의를 찾을 수 없습니다", {
          courseId: "존재하지 않는 강의",
        }),
        { status: 400 },
      );
    }

    if (course.currentEnrollment >= course.maxCapacity) {
      return HttpResponse.json(
        errorBody("COURSE_FULL", "정원이 가득 찼습니다"),
        { status: 409 },
      );
    }

    const seatsNeeded = data.type === "group" ? data.group.headCount : 1;
    if (course.currentEnrollment + seatsNeeded > course.maxCapacity) {
      return HttpResponse.json(
        errorBody("COURSE_FULL", "잔여석이 부족합니다"),
        { status: 409 },
      );
    }

    if (isDuplicateEnrollment(data.courseId, data.applicant.email)) {
      return HttpResponse.json(
        errorBody("DUPLICATE_ENROLLMENT", "이미 신청한 강의입니다"),
        { status: 409 },
      );
    }

    const ok = incrementEnrollment(data.courseId, seatsNeeded);
    if (!ok) {
      return HttpResponse.json(
        errorBody("COURSE_FULL", "잔여석이 부족합니다"),
        { status: 409 },
      );
    }

    const record = addEnrollment(data.courseId, data.applicant.email);
    const response: EnrollmentResponse = {
      enrollmentId: record.enrollmentId,
      status: "confirmed",
      enrolledAt: record.enrolledAt,
    };
    return HttpResponse.json(response, { status: 201 });
  }),
];
