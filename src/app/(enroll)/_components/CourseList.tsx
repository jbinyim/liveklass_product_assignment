"use client";

import { useFormContext } from "react-hook-form";
import { useCourses } from "@/app/(enroll)/_shared/hooks/useCourses";
import { CourseCard } from "./CourseCard";
import { Button } from "@/components/ui/button";
import type { CategoryFilterValue } from "./CategoryFilter";
import type { EnrollmentForm } from "@/app/(enroll)/_shared/schema";

interface CourseListProps {
  category: CategoryFilterValue;
}

function SkeletonCard() {
  return (
    <div className="h-[140px] rounded-[var(--radius-card)] border border-gray-200 bg-[var(--color-surface)] animate-pulse" />
  );
}

export function CourseList({ category }: CourseListProps) {
  const { data, isLoading, isError, refetch } = useCourses();
  const { setValue, watch } = useFormContext<EnrollmentForm>();
  const selectedId = watch("courseId");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-live="polite" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-gray-200 bg-white p-8"
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          강의 목록을 불러오지 못했습니다.
        </p>
        <Button variant="secondary" onClick={() => refetch()}>
          재시도
        </Button>
      </div>
    );
  }

  const filtered =
    category === "all"
      ? (data ?? [])
      : (data ?? []).filter((c) => c.category === category);

  if (filtered.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          선택한 카테고리에 강의가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="강의 목록">
      {filtered.map((course) => (
        <li key={course.id}>
          <CourseCard
            course={course}
            selected={selectedId === course.id}
            onSelect={(id) =>
              setValue("courseId", id, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </li>
      ))}
    </ul>
  );
}
