import { fetcher } from "@/lib/api/fetcher";
import type { Category } from "@/app/(enroll)/_shared/constants";
import type { CourseListResponse } from "./types";

export function getCourses(
  category?: Category | "all",
  signal?: AbortSignal,
): Promise<CourseListResponse> {
  const path =
    category && category !== "all"
      ? `/api/courses?category=${encodeURIComponent(category)}`
      : "/api/courses";
  return fetcher<CourseListResponse>(path, { signal });
}
