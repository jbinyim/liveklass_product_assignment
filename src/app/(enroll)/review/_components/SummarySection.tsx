"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { useCourses } from "@/app/(enroll)/_shared/hooks/useCourses";
import { useStepNavigation } from "@/app/(enroll)/_shared/hooks/useStepNavigation";
import type { Category } from "@/app/(enroll)/_shared/constants";
import type {
  EnrollmentForm,
  GroupEnrollment,
  Step,
} from "@/app/(enroll)/_shared/schema";

type GroupBlock = GroupEnrollment["group"];

const CATEGORY_LABEL: Record<Category, string> = {
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

interface RowProps {
  label: string;
  children: ReactNode;
}

function Row({ label, children }: RowProps) {
  return (
    <div className="flex gap-4 text-sm">
      <span className="w-16 shrink-0 text-[var(--color-text-muted)] sm:w-20">
        {label}
      </span>
      <span className="flex-1 font-medium text-[var(--color-text-primary)]">
        {children}
      </span>
    </div>
  );
}

interface CardProps {
  title: string;
  editStep: Step;
  children: ReactNode;
}

function Card({ title, editStep, children }: CardProps) {
  const nav = useStepNavigation();
  return (
    <section className="rounded-[var(--radius-card)] border border-gray-200 bg-white p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => nav.goToStep(editStep)}
          className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] rounded"
        >
          수정
        </button>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

export function SummarySection() {
  const { watch } = useFormContext<EnrollmentForm>();
  const { data } = useCourses();
  const courses = data?.courses ?? [];
  const courseId = watch("courseId") ?? "";
  const type = watch("type");
  const applicant = watch("applicant");
  const group = watch("group" as never) as unknown as GroupBlock | undefined;
  const course = courses.find((c) => c.id === courseId);

  return (
    <div className="flex flex-col gap-4">
      <Card title="강의 정보" editStep="course">
        {course ? (
          <>
            <Row label="제목">{course.title}</Row>
            <Row label="강사">{course.instructor}</Row>
            <Row label="가격">{course.price.toLocaleString("ko-KR")}원</Row>
            <Row label="기간">
              {course.startDate} ~ {course.endDate}
            </Row>
            <Row label="카테고리">{CATEGORY_LABEL[course.category]}</Row>
          </>
        ) : (
          <Row label="강의">선택된 강의가 없습니다</Row>
        )}
        <Row label="신청 유형">{type === "group" ? "단체" : "개인"}</Row>
      </Card>

      <Card title="신청자 정보" editStep="applicant">
        <Row label="이름">{applicant?.name}</Row>
        <Row label="이메일">{applicant?.email}</Row>
        <Row label="전화">{applicant?.phone}</Row>
        {applicant?.motivation && (
          <Row label="수강 동기">{applicant.motivation}</Row>
        )}
      </Card>

      {type === "group" && group && (
        <Card title="단체 정보" editStep="applicant">
          <Row label="단체명">{group.organizationName}</Row>
          <Row label="담당자">{group.contactPerson}</Row>
          <Row label="인원수">{group.headCount}명</Row>
          <Row label="참가자">
            <ul className="flex flex-col gap-0.5">
              {group.participants?.map((p, i) => (
                <li key={i}>
                  {p.name} ({p.email})
                </li>
              ))}
            </ul>
          </Row>
        </Card>
      )}
    </div>
  );
}
