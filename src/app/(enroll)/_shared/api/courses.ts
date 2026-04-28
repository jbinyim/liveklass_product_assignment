import { fetcher } from "@/lib/api/fetcher";
import type { Course } from "./types";

export function getCourses(signal?: AbortSignal): Promise<Course[]> {
  return fetcher<Course[]>("/api/courses", { signal });
}
