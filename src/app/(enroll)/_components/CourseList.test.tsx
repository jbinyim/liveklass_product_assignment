import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/lib/mocks/server";
import { CourseList } from "./CourseList";
import { createFormWrapper } from "@/app/(enroll)/_shared/hooks/__test__/formWrapper";
import { createQueryWrapper } from "@/app/(enroll)/_shared/hooks/__test__/queryWrapper";
import type { ReactNode } from "react";

function setup(initial?: Parameters<typeof createFormWrapper>[0]) {
  const { Wrapper: QueryWrapper } = createQueryWrapper();
  const { Wrapper: FormWrapper } = createFormWrapper(initial);
  function Combined({ children }: { children: ReactNode }) {
    return (
      <QueryWrapper>
        <FormWrapper>{children}</FormWrapper>
      </QueryWrapper>
    );
  }
  return { Wrapper: Combined };
}

describe("CourseList", () => {
  it("로딩 중 스켈레톤 노출", () => {
    const { Wrapper } = setup();
    render(
      <Wrapper>
        <CourseList category="all" />
      </Wrapper>,
    );
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("성공 시 강의 카드 렌더 + 선택된 카드 강조", async () => {
    const { Wrapper } = setup({ courseId: "course-001" });
    render(
      <Wrapper>
        <CourseList category="all" />
      </Wrapper>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("강의 목록")).toBeInTheDocument(),
    );
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
    const selected = items.find((li) =>
      li.querySelector('[aria-pressed="true"]'),
    );
    expect(selected).toBeDefined();
  });

  it("카드 클릭 시 폼 courseId 업데이트", async () => {
    const user = userEvent.setup();
    const { Wrapper } = setup();
    render(
      <Wrapper>
        <CourseList category="all" />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("강의 목록"));
    const buttons = screen.getAllByRole("button", { name: /React|UX|마케팅|OKR|재무|콘텐츠|피그마|프론트엔드/ });
    await user.click(buttons[0]!);
    await waitFor(() => {
      expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("필터 적용 시 다른 카테고리는 숨김", async () => {
    const { Wrapper } = setup();
    render(
      <Wrapper>
        <CourseList category="design" />
      </Wrapper>,
    );
    await waitFor(() => screen.getByLabelText("강의 목록"));
    expect(screen.queryByText(/프론트엔드 기초/)).not.toBeInTheDocument();
    expect(screen.getByText(/UX 리서치/)).toBeInTheDocument();
  });

  it("서버 에러 시 재시도 UI", async () => {
    server.use(
      http.get("/api/courses", () => HttpResponse.json({}, { status: 500 })),
    );
    const { Wrapper } = setup();
    render(
      <Wrapper>
        <CourseList category="all" />
      </Wrapper>,
    );
    await waitFor(() => screen.getByRole("alert"));
    expect(screen.getByText(/불러오지 못했습니다/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "재시도" })).toBeInTheDocument();
  });
});
