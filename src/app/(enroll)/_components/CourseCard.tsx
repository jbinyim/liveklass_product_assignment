"use client";

import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { SEATS_LOW_THRESHOLD } from "@/app/(enroll)/_shared/constants";
import type { Category } from "@/app/(enroll)/_shared/constants";
import type { Course } from "@/app/(enroll)/_shared/api/types";

const CATEGORY_LABEL: Record<Category, string> = {
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

interface CourseCardProps {
  course: Course;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function CourseCard({ course, selected, onSelect }: CourseCardProps) {
  const remaining = course.maxCapacity - course.currentEnrollment;
  const isFull = remaining <= 0;
  const isLow = !isFull && remaining <= SEATS_LOW_THRESHOLD;

  return (
    <button
      type="button"
      onClick={() => !isFull && onSelect(course.id)}
      disabled={isFull}
      aria-pressed={selected}
      aria-label={`${course.title} 강의 선택`}
      className={clsx(
        "flex w-full flex-col gap-3 rounded-[var(--radius-card)] border bg-white p-5 text-left transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
        !isFull && !selected && "border-gray-200 hover:border-gray-300",
        selected &&
          "border-[var(--color-primary)] border-2 bg-[var(--color-primary-soft)]/30",
        isFull &&
          "border-gray-200 bg-[var(--color-surface)] opacity-70 cursor-not-allowed",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex-1 text-lg font-bold text-[var(--color-text-primary)]">
          {course.title}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="info">{CATEGORY_LABEL[course.category]}</Badge>
          {isFull && <Badge variant="full">마감</Badge>}
          {isLow && <Badge variant="low">마감임박 {remaining}석</Badge>}
        </div>
      </div>

      <p
        className={clsx(
          "text-sm leading-relaxed",
          isFull
            ? "text-[var(--color-text-muted)]"
            : "text-[var(--color-text-secondary)]",
        )}
      >
        {course.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
        <span>{course.instructor}</span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold text-[var(--color-text-primary)]">
          {course.price.toLocaleString("ko-KR")}원
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {course.startDate} ~ {course.endDate}
        </span>
      </div>
    </button>
  );
}
