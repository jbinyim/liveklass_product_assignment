"use client";

import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/app/(enroll)/_shared/api/courses";
import type { Category } from "@/app/(enroll)/_shared/constants";

export const COURSES_QUERY_KEY = ["courses"] as const;

export function useCourses(category?: Category | "all") {
  return useQuery({
    queryKey: [...COURSES_QUERY_KEY, category ?? "all"] as const,
    queryFn: ({ signal }) => getCourses(category, signal),
  });
}
