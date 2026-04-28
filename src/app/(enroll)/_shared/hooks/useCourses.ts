"use client";

import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/app/(enroll)/_shared/api/courses";

export const COURSES_QUERY_KEY = ["courses"] as const;

export function useCourses() {
  return useQuery({
    queryKey: COURSES_QUERY_KEY,
    queryFn: ({ signal }) => getCourses(signal),
  });
}
