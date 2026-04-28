import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseCard } from "./CourseCard";
import type { Course } from "@/app/(enroll)/_shared/api/types";

const baseCourse: Course = {
  id: "course-001",
  title: "React 입문",
  description: "초보자를 위한 강의",
  category: "development",
  price: 150000,
  maxCapacity: 30,
  currentEnrollment: 12,
  startDate: "2026-05-01",
  endDate: "2026-05-30",
  instructor: "김강사",
};

describe("CourseCard", () => {
  it("기본 정보 표시 + 카테고리 배지", () => {
    render(<CourseCard course={baseCourse} selected={false} onSelect={() => {}} />);
    expect(screen.getByText("React 입문")).toBeInTheDocument();
    expect(screen.getByText("개발")).toBeInTheDocument();
    expect(screen.getByText("150,000원")).toBeInTheDocument();
  });

  it("일반 카드: 클릭 시 onSelect(id) 호출", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CourseCard course={baseCourse} selected={false} onSelect={onSelect} />);
    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith("course-001");
  });

  it("선택됨: aria-pressed='true'", () => {
    render(<CourseCard course={baseCourse} selected onSelect={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("마감임박(잔여 ≤ 5): low 배지 노출 + 잔여수 표시", () => {
    const lowCourse = { ...baseCourse, currentEnrollment: 27 };
    render(<CourseCard course={lowCourse} selected={false} onSelect={() => {}} />);
    expect(screen.getByText(/마감임박 3석/)).toBeInTheDocument();
  });

  it("마감(=== maxCapacity): full 배지 + disabled + 클릭 차단", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const fullCourse = { ...baseCourse, currentEnrollment: 30 };
    render(<CourseCard course={fullCourse} selected={false} onSelect={onSelect} />);
    expect(screen.getByText("마감")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    await user.click(screen.getByRole("button"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("잔여 5인 경우 마감임박 배지 (경계값 포함)", () => {
    const edgeCourse = { ...baseCourse, currentEnrollment: 25 };
    render(<CourseCard course={edgeCourse} selected={false} onSelect={() => {}} />);
    expect(screen.getByText(/마감임박 5석/)).toBeInTheDocument();
  });

  it("잔여 6인 경우 배지 없음 (경계값 - 1)", () => {
    const okCourse = { ...baseCourse, currentEnrollment: 24 };
    render(<CourseCard course={okCourse} selected={false} onSelect={() => {}} />);
    expect(screen.queryByText(/마감임박/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^마감$/)).not.toBeInTheDocument();
  });
});
