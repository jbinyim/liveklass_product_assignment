"use client";

import clsx from "clsx";
import {
  CATEGORIES,
  type Category,
} from "@/app/(enroll)/_shared/constants";

const LABEL: Record<Category, string> = {
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

export type CategoryFilterValue = Category | "all";

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (next: CategoryFilterValue) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const items: { id: CategoryFilterValue; label: string }[] = [
    { id: "all", label: "전체" },
    ...CATEGORIES.map((c) => ({ id: c, label: LABEL[c] })),
  ];

  return (
    <div role="tablist" aria-label="카테고리" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={clsx(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
              active
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-[var(--color-text-secondary)] border border-gray-300 hover:bg-gray-50",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
